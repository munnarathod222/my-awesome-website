import { Router } from 'express';
import pb from '../utils/pocketbaseClient.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import logger from '../utils/logger.js';

const router = Router();

// Change email route - secured with pocketbaseAuth middleware
router.post('/change-email', pocketbaseAuth, async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.pocketbaseUserId;

  if (!newEmail) {
    return res.status(400).json({ error: 'New email address is required' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  logger.info(`[API/User] Attempting email change for user ID ${userId} to ${newEmail}`);

  try {
    // 1. Check if email is already in use by another user in pocketbase
    let existing;
    try {
      existing = await pb.collection('users').getFirstListItem(`email = "${newEmail}"`, { $autoCancel: false });
    } catch (e) {
      // not found is expected/good
    }

    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: 'Email address is already in use by another account' });
    }

    // 2. Perform the update using the backend admin client
    const updatedRecord = await pb.collection('users').update(userId, {
      email: newEmail,
      emailVisibility: true
    }, { $autoCancel: false });

    logger.info(`[API/User] Email updated successfully for user ID ${userId}`);

    return res.json({
      success: true,
      message: 'Email updated successfully',
      user: {
        id: updatedRecord.id,
        email: updatedRecord.email,
        full_name: updatedRecord.full_name,
        name: updatedRecord.name
      }
    });
  } catch (err) {
    logger.error(`[API/User] Error updating email: ${err.message}`);
    return res.status(500).json({ error: err.message || 'Failed to update email' });
  }
});

export default router;
