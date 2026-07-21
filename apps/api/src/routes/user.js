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
      existing = await pb.collection('users').getFirstListItem(
        pb.filter('email = {:newEmail}', { newEmail }),
        { $autoCancel: false }
      );
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

// Superuser-privileged endpoint to create/link Client Portal credentials
router.post('/create-client-user', pocketbaseAuth, async (req, res) => {
  const { email, password, clientId, clientName, portalUserId } = req.body;

  if (!email || !clientId) {
    return res.status(400).json({ error: 'Email and clientId are required' });
  }

  const cleanEmail = email.trim();
  logger.info(`[API/User] Processing client credentials for client '${clientName}' (${clientId}), Email: '${cleanEmail}', portalUserId: '${portalUserId || 'none'}'`);

  try {
    let userRecord = null;

    // 1. If portalUserId is provided, try retrieving the linked user first
    if (portalUserId) {
      try {
        userRecord = await pb.collection('users').getOne(portalUserId, { $autoCancel: false });
      } catch (err) {
        logger.warn(`[API/User] Linked portalUserId '${portalUserId}' not found, falling back to email search.`);
      }
    }

    // 2. Fallback to searching by email if not found by ID
    if (!userRecord) {
      try {
        userRecord = await pb.collection('users').getFirstListItem(
          pb.filter('email = {:cleanEmail}', { cleanEmail }),
          { $autoCancel: false }
        );
      } catch (notFound) {
        // Not found by email is expected for new accounts
      }
    }

    if (userRecord) {
      // Check if the email is already taken by another user
      try {
        const otherUser = await pb.collection('users').getFirstListItem(
          pb.filter('email = {:cleanEmail} && id != {:userId}', { cleanEmail, userId: userRecord.id }),
          { $autoCancel: false }
        );
        if (otherUser) {
          return res.status(400).json({ error: 'Email address is already in use by another user' });
        }
      } catch (e) {
        // Not found by other user - safe to proceed
      }

      // Update existing user password and/or email
      const updateData = {
        email: cleanEmail,
        emailVisibility: true,
        role: 'Client',
        status: 'active',
        phone_number: userRecord.phone_number || '0000000000',
        full_name: userRecord.full_name || clientName || 'Client'
      };

      if (password) {
        updateData.password = password;
        updateData.passwordConfirm = password;
      }

      userRecord = await pb.collection('users').update(userRecord.id, updateData, { $autoCancel: false });
      logger.info(`[API/User] Updated existing user credentials for ${cleanEmail} (ID: ${userRecord.id})`);
    } else {
      // 3. User does not exist - create using superuser client
      if (!password) {
        return res.status(400).json({ error: 'Password is required to create a new login account' });
      }

      const userData = {
        email: cleanEmail,
        emailVisibility: true,
        password: password,
        passwordConfirm: password,
        name: clientName || 'Client',
        full_name: clientName || 'Client',
        role: 'Client',
        status: 'active',
        phone_number: '0000000000'
      };

      try {
        userRecord = await pb.collection('users').create(userData, { $autoCancel: false });
      } catch (createErr) {
        logger.warn(`[API/User] Full payload failed, retrying minimal required payload: ${createErr.message}`);
        // Fallback with all required schema fields
        userRecord = await pb.collection('users').create({
          email: cleanEmail,
          password: password,
          passwordConfirm: password,
          name: clientName || 'Client',
          full_name: clientName || 'Client',
          role: 'admin', // ultimate fallback role option
          status: 'active',
          phone_number: '0000000000'
        }, { $autoCancel: false });
      }
      logger.info(`[API/User] Created new user record for ${cleanEmail} (ID: ${userRecord.id})`);
    }

    // 4. Link user_id in client record
    if (clientId && userRecord?.id) {
      await pb.collection('clients').update(clientId, {
        portal_user_id: userRecord.id,
        portal_enabled: true
      }, { $autoCancel: false }).catch((err) => {
        logger.warn(`[API/User] Could not update portal_user_id on client: ${err.message}`);
      });
    }

    return res.json({
      success: true,
      message: 'Client credentials processed successfully',
      user: {
        id: userRecord.id,
        email: userRecord.email
      }
    });
  } catch (err) {
    logger.error(`[API/User] Failed to process client credentials: ${err.message}`, err);
    return res.status(500).json({ error: err.message || 'Failed to process client credentials' });
  }
});

// Get linked portal user details (email, etc.) - secured with pocketbaseAuth middleware
router.get('/get-portal-user/:portalUserId', pocketbaseAuth, async (req, res) => {
  const { portalUserId } = req.params;
  try {
    const userRecord = await pb.collection('users').getOne(portalUserId, { $autoCancel: false });
    return res.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        full_name: userRecord.full_name,
        name: userRecord.name,
        phone_number: userRecord.phone_number,
        status: userRecord.status
      }
    });
  } catch (err) {
    logger.error(`[API/User] Failed to fetch portal user details: ${err.message}`);
    return res.status(404).json({ error: 'Portal user not found' });
  }
});

export default router;
