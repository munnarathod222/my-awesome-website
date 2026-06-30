import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * PUT/PATCH /api/fuel-logs/:id
 * Update a fuel log, sync with the associated expense and cashbook records.
 */
const handleUpdate = async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body };

  try {
    // 1. Get original fuel tracker record
    const originalLog = await pb.collection('fuel_tracker').getOne(id);
    if (!originalLog) {
      return res.status(404).json({ error: `Fuel log with ID ${id} not found` });
    }

    // 2. Update fuel tracker
    const updatedLog = await pb.collection('fuel_tracker').update(id, updateData);

    // 3. Find associated expense
    let expense = null;
    try {
      expense = await pb.collection('expenses').getFirstListItem(`fuel_tracker_id="${id}"`);
    } catch (e) {
      logger.warn(`No associated expense found for fuel log ${id}: ${e.message}`);
    }

    if (expense) {
      const expensePaymentMethodMap = {
        'Cash': 'Cash',
        'Credit Card': 'Credit Card',
        'Debit Card': 'Debit Card',
        'UPI': 'UPI',
        'Bank Transfer': 'Bank Transfer'
      };

      const updatedExpenseData = {
        amount: updatedLog.total_cost,
        liters: updatedLog.liters,
        date: updatedLog.date,
        description: `${updatedLog.truck_number || 'Unknown'} - ${updatedLog.distance_driven || 0} KMs Driven - ${updatedLog.liters || 0} L`,
        payment_method: expensePaymentMethodMap[updatedLog.payment_method] || 'Cash'
      };

      if (updatedLog.credit_card_id) {
        updatedExpenseData.credit_card_id = updatedLog.credit_card_id;
      }

      // Update expense
      const updatedExpense = await pb.collection('expenses').update(expense.id, updatedExpenseData);

      // 4. Find and update corresponding cashbook entry
      let cashbookEntry = null;
      try {
        cashbookEntry = await pb.collection('cashbook').getFirstListItem(
          `reference_id="${expense.id}"`
        );
      } catch (e) {
        logger.warn(`No cashbook entry found for expense ${expense.id}: ${e.message}`);
      }

      if (cashbookEntry) {
        await pb.collection('cashbook').update(cashbookEntry.id, {
          amount: updatedExpense.amount,
          description: updatedExpense.description,
          category: updatedExpense.subcategory || updatedExpense.category || 'Fuel',
          date: updatedExpense.date,
          // Sync payment details or status
          status: updatedExpense.status === 'Approved' ? 'Completed' : 'Pending'
        });
      }
    }

    logger.info(`Fuel log ${id} updated successfully and synced with expense & cashbook`);
    return res.status(200).json({
      success: true,
      message: 'Fuel log updated successfully',
      fuelLog: updatedLog
    });
  } catch (err) {
    logger.error(`Error updating fuel log ${id}:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to update fuel log'
    });
  }
};

router.put('/:id', handleUpdate);
router.patch('/:id', handleUpdate);

/**
 * DELETE /api/fuel-logs/:id
 * Delete a fuel log and automatically remove linked expense and cashbook records.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get original fuel tracker record
    const originalLog = await pb.collection('fuel_tracker').getOne(id);
    if (!originalLog) {
      return res.status(404).json({ error: `Fuel log with ID ${id} not found` });
    }

    // 2. Find associated expense
    let expense = null;
    try {
      expense = await pb.collection('expenses').getFirstListItem(`fuel_tracker_id="${id}"`);
    } catch (e) {
      logger.warn(`No associated expense found for fuel log ${id} during delete`);
    }

    if (expense) {
      // 3. Find and delete corresponding cashbook entry
      let cashbookEntry = null;
      try {
        cashbookEntry = await pb.collection('cashbook').getFirstListItem(
          `reference_id="${expense.id}"`
        );
      } catch (e) {
        logger.warn(`No cashbook entry found for expense ${expense.id} during delete`);
      }

      if (cashbookEntry) {
        await pb.collection('cashbook').delete(cashbookEntry.id);
        logger.info(`Cashbook entry ${cashbookEntry.id} deleted for expense ${expense.id}`);
      }

      // 4. Delete expense
      await pb.collection('expenses').delete(expense.id);
      logger.info(`Expense ${expense.id} deleted for fuel log ${id}`);
    }

    // 5. Delete fuel log
    await pb.collection('fuel_tracker').delete(id);
    logger.info(`Fuel log ${id} deleted successfully`);

    return res.status(200).json({
      success: true,
      message: 'Fuel log deleted successfully'
    });
  } catch (err) {
    logger.error(`Error deleting fuel log ${id}:`, err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to delete fuel log'
    });
  }
});

export default router;
