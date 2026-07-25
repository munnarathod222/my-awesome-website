import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import { enforceFinancialLockdown } from '../middleware/financial-lockdown.js';

const router = express.Router();

router.use(pocketbaseAuth);
router.use(enforceFinancialLockdown('cashbook'));

/**
 * GET /cashbook
 * Fetch all cashbook transactions for the authenticated user
 */
router.get('/', async (req, res) => {
  const userId = req.auth?.id;

  if (!userId) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  logger.info('GET /cashbook - Fetching transactions for user', { userId });

  // Use the correct 'cashbook' collection
  const transactions = await pb.collection('cashbook').getFullList({
    filter: `added_by = "${userId}"`,
    sort: '-date,-created',
  });

  logger.info('GET /cashbook - Successfully fetched transactions', { 
    userId, 
    count: transactions.length 
  });

  res.json({ success: true, data: transactions });
});

/**
 * GET /cashbook/:id
 * Get a specific cashbook transaction
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    const error = new Error('Transaction ID is required and must be a valid string');
    error.status = 400;
    throw error;
  }

  logger.info('GET /cashbook/:id - Fetching transaction', { id });

  try {
    const transaction = await pb.collection('cashbook').getOne(id);
    res.json({ success: true, data: transaction });
  } catch (err) {
    if (err.status === 404) {
      const error = new Error('Transaction not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }
});

/**
 * DELETE /cashbook/:id
 * Delete a cashbook transaction
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    const error = new Error('Transaction ID is required and must be a valid string');
    error.status = 400;
    throw error;
  }

  logger.info('DELETE /cashbook/:id - Starting transaction deletion', { transactionId: id });

  let transaction;
  try {
    // 1. Check if transaction exists in 'cashbook' collection
    transaction = await pb.collection('cashbook').getOne(id);
  } catch (err) {
    if (err.status === 404) {
      const error = new Error('Transaction not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }

  // 2. Handle linked expenses: delete linked expense if present, or continue if already deleted
  if (transaction.reference_type === 'expense') {
    if (transaction.reference_id) {
      try {
        await pb.collection('expenses').delete(transaction.reference_id, { $autoCancel: false });
        logger.info(`DELETE /cashbook/:id - Also deleted linked expense ${transaction.reference_id}`);
      } catch (expErr) {
        if (expErr.status !== 404) {
          logger.warn('DELETE /cashbook/:id - Could not delete linked expense:', expErr.message);
        }
      }
    }
  }

  // 3. Check for active system-linked modules (advance, payroll, salary)
  const systemLinkedTypes = ['salary', 'advance', 'payroll'];
  if (systemLinkedTypes.includes(transaction.reference_type) && transaction.reference_id) {
    let linkedExists = false;
    if (transaction.reference_type === 'advance') {
      try {
        await pb.collection('advances').getOne(transaction.reference_id, { $autoCancel: false });
        linkedExists = true;
      } catch (e) {
        linkedExists = false;
      }
    } else if (transaction.reference_type === 'payroll' || transaction.reference_type === 'salary') {
      try {
        await pb.collection('payroll_payments').getOne(transaction.reference_id, { $autoCancel: false });
        linkedExists = true;
      } catch (e) {
        linkedExists = false;
      }
    }

    if (linkedExists) {
      logger.warn('DELETE /cashbook/:id - Transaction is linked to an active system module', {
        transactionId: id,
        referenceType: transaction.reference_type
      });
      const error = new Error(`This transaction is linked to an active ${transaction.reference_type} record. Please manage it from that section.`);
      error.status = 409;
      throw error;
    }
  }

  // 4. Delete the transaction
  await pb.collection('cashbook').delete(id, { $autoCancel: false });

  logger.info('DELETE /cashbook/:id - Transaction deleted successfully', {
    transactionId: id,
    userId: req.auth?.id || 'anonymous',
  });

  res.json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

export default router;