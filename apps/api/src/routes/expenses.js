import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { enforceFinancialLockdown } from '../middleware/financial-lockdown.js';

const router = express.Router();

router.use(pocketbaseAuth);
router.use(enforceFinancialLockdown('expenses'));

/**
 * POST /expenses
 * Create a new expense and sync to cashbook
 */
router.post('/', async (req, res) => {
  const { amount, description, category, subcategory, date, userId, status } = req.body;

  if (!amount || !userId) {
    return res.status(400).json({
      error: 'amount and userId are required',
    });
  }

  try {
    // Create expense in PocketBase
    const expense = await pb.collection('expenses').create({
      amount,
      description: description || '',
      category: category || '',
      subcategory: subcategory || '',
      date: date || new Date().toISOString(),
      userId,
      status: status || 'pending',
    });

    // Create corresponding cashbook entry
    const cashbookEntry = await pb.collection('cashbook').create({
      added_by: userId,
      reference_id: expense.id,
      reference_type: 'regular_expense',
      transaction_type: 'Expense',
      amount: expense.amount,
      description: expense.description || 'Regular Expense',
      category: expense.subcategory || expense.category || 'Expenses',
      date: expense.date,
      status: 'Pending',
    });

    logger.info(`Expense ${expense.id} created and synced to cashbook`);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense,
      cashbookEntry,
    });
  } catch (error) {
    logger.error('Error creating expense:', error.message);
    throw error;
  }
});

/**
 * GET /expenses/:userId
 * Get all expenses for a user
 */
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: 'userId is required',
    });
  }

  const expenses = await pb.collection('expenses').getFullList({
    filter: pb.filter('userId = {:userId}', { userId }),
    sort: '-created',
  });

  res.json({
    success: true,
    expenses,
  });
});

/**
 * GET /expenses/detail/:expenseId
 * Get a specific expense
 */
router.get('/detail/:expenseId', async (req, res) => {
  const { expenseId } = req.params;

  if (!expenseId) {
    return res.status(400).json({
      error: 'expenseId is required',
    });
  }

  const expense = await pb.collection('expenses').getOne(expenseId);

  if (!expense) {
    throw new Error(`Expense with ID ${expenseId} not found`);
  }

  res.json({
    success: true,
    expense,
  });
});

/**
 * PUT /expenses/:expenseId
 * Update an expense and sync to cashbook
 */
router.put('/:expenseId', async (req, res) => {
  const { expenseId } = req.params;
  const { amount, description, category, subcategory, date, status } = req.body;

  if (!expenseId) {
    return res.status(400).json({
      error: 'expenseId is required',
    });
  }

  try {
    // Get the original expense to find userId
    const originalExpense = await pb.collection('expenses').getOne(expenseId);

    if (!originalExpense) {
      throw new Error(`Expense with ID ${expenseId} not found`);
    }

    // Update expense
    const updatedExpense = await pb.collection('expenses').update(expenseId, {
      ...(amount !== undefined && { amount }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(subcategory !== undefined && { subcategory }),
      ...(date !== undefined && { date }),
      ...(status !== undefined && { status }),
    });

    // Find and update corresponding cashbook entry
    let cashbookEntry = null;
    try {
      cashbookEntry = await pb.collection('cashbook').getFirstListItem(
        `reference_id="${expenseId}" && reference_type="regular_expense"`
      );
    } catch (error) {
      if (!error.message.includes('Failed to find')) {
        throw error;
      }
    }

    if (cashbookEntry) {
      await pb.collection('cashbook').update(cashbookEntry.id, {
        amount: updatedExpense.amount,
        description: updatedExpense.description || 'Regular Expense',
        category: updatedExpense.subcategory || updatedExpense.category || 'Expenses',
        date: updatedExpense.date,
        status: updatedExpense.status === 'Approved' ? 'Completed' : 'Pending',
      });
      logger.info(`Expense ${expenseId} updated and cashbook entry synced`);
    } else {
      throw new Error(`Cashbook entry not found for expense ${expenseId}`);
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    logger.error('Error updating expense:', error.message);
    throw error;
  }
});

/**
 * DELETE /expenses/:expenseId
 * Delete an expense and remove from cashbook
 */
router.delete('/:expenseId', async (req, res) => {
  const { expenseId } = req.params;

  if (!expenseId) {
    return res.status(400).json({
      error: 'expenseId is required',
    });
  }

  try {
    // Get the expense to verify it exists
    const expense = await pb.collection('expenses').getOne(expenseId);

    if (!expense) {
      throw new Error(`Expense with ID ${expenseId} not found`);
    }

    // Find and delete corresponding cashbook entry
    let cashbookEntry = null;
    try {
      cashbookEntry = await pb.collection('cashbook').getFirstListItem(
        `reference_id="${expenseId}" && reference_type="regular_expense"`
      );
    } catch (error) {
      if (!error.message.includes('Failed to find')) {
        throw error;
      }
    }

    if (cashbookEntry) {
      await pb.collection('cashbook').delete(cashbookEntry.id);
      logger.info(`Cashbook entry deleted for expense ${expenseId}`);
    } else {
      throw new Error(`Cashbook entry not found for expense ${expenseId}`);
    }

    // Delete expense
    await pb.collection('expenses').delete(expenseId);
    logger.info(`Expense ${expenseId} deleted`);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting expense:', error.message);
    throw error;
  }
});

export default router;