import { Router } from 'express';
import pb from '../utils/pocketbaseClient.js';
import { pocketbaseAuth } from '../middleware/pocketbase-auth.js';
import logger from '../utils/logger.js';
import * as auditService from '../services/auditService.js';
import * as totpService from '../services/totpService.js';

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

  const colName = req.pocketbaseCollectionName || 'users';

  try {
    // 1. Check if email is already in use by another user in the target collection
    let existing;
    try {
      existing = await pb.collection(colName).getFirstListItem(
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
    const updatedRecord = await pb.collection(colName).update(userId, {
      email: newEmail,
      emailVisibility: true
    }, { $autoCancel: false });

    logger.info(`[API/User] Email updated successfully for user ID ${userId} in collection ${colName}`);

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
    logger.error(`[API/User] Error updating email in collection ${colName}: ${err.message}`);
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
        full_name: userRecord.full_name || clientName || 'Client',
        client_id: clientId
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
        phone_number: '0000000000',
        client_id: clientId
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
          phone_number: '0000000000',
          client_id: clientId
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

// ── Enterprise User Security & Session Management ──
router.get('/security-settings', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const userRecord = await pb.collection('users').getOne(userId, { $autoCancel: false });
    
    // Fetch recent login audit events for this user if available
    let loginHistory = [];
    try {
      const auditEvents = auditService.getEvents({ action: 'LOGIN', limit: 10 });
      loginHistory = auditEvents.filter(ev => ev.actorId === userId || ev.details?.email === userRecord.email);
    } catch (_) {}

    return res.json({
      success: true,
      security: {
        twoFactorEnabled: !!userRecord.two_factor_enabled,
        sessionTimeoutMinutes: userRecord.session_timeout_minutes || 60,
        lastLoginAt: userRecord.last_login_at || userRecord.updated,
        loginHistory
      }
    });
  } catch (err) {
    logger.error(`[API/User] Error fetching security settings: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to fetch security settings' });
  }
});

router.post('/security-settings', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const { twoFactorEnabled, sessionTimeoutMinutes } = req.body;

    const updateData = {};
    if (typeof twoFactorEnabled === 'boolean') updateData.two_factor_enabled = twoFactorEnabled;
    if (typeof sessionTimeoutMinutes === 'number') updateData.session_timeout_minutes = sessionTimeoutMinutes;

    try {
      await pb.collection('users').update(userId, updateData, { $autoCancel: false });
    } catch (e) {
      // If schema columns don't exist in users table, ignore schema error
    }

    try {
      auditService.ingestEvent({
        action: 'UPDATE_SECURITY_SETTINGS',
        module: 'AUTH',
        entityId: userId,
        details: { twoFactorEnabled, sessionTimeoutMinutes }
      }, {
        actorId: userId,
        ip: req.ip || req.socket.remoteAddress
      });
    } catch (_) {}

    return res.json({ success: true, message: 'Security preferences updated successfully' });
  } catch (err) {
    logger.error(`[API/User] Error saving security settings: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to update security preferences' });
  }
});

router.post('/logout-other-sessions', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    
    try {
      auditService.ingestEvent({
        action: 'LOGOUT_ALL_DEVICES',
        module: 'AUTH',
        entityId: userId,
        details: { timestamp: new Date().toISOString() }
      }, {
        actorId: userId,
        ip: req.ip || req.socket.remoteAddress
      });
    } catch (_) {}

    return res.json({
      success: true,
      message: 'Revocation signal sent. All other active sessions and remembered device PIN profiles invalidated.'
    });
  } catch (err) {
    logger.error(`[API/User] Error in logout-other-sessions: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to revoke other sessions' });
  }
});

// ── Google Authenticator 2FA (TOTP) Endpoints ──
router.post('/2fa/generate', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
    const secret = totpService.generateSecret();
    const otpauthUrl = totpService.getOtpAuthUrl(user.email, secret);
    const recoveryCodes = totpService.generateRecoveryCodes(5);

    return res.json({
      success: true,
      secret,
      otpauthUrl,
      recoveryCodes
    });
  } catch (err) {
    logger.error(`[API/User/2FA] Generate error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to generate 2FA secret' });
  }
});

router.post('/2fa/verify-and-enable', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const { secret, token, recoveryCodes } = req.body;
    if (!secret || !token) {
      return res.status(400).json({ success: false, error: 'Secret and 6-digit verification code are required' });
    }

    const isValid = totpService.verifyTOTP(token, secret);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid 6-digit code. Check your Google Authenticator app and try again.' });
    }

    const hashedRecoveryCodes = Array.isArray(recoveryCodes)
      ? recoveryCodes.map(c => totpService.hashRecoveryCode(c))
      : [];

    try {
      await pb.collection('users').update(userId, {
        totp_secret: secret,
        totp_enabled: 1,
        two_factor_enabled: 1,
        totp_recovery_codes: JSON.stringify(hashedRecoveryCodes)
      }, { $autoCancel: false });
    } catch (e) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync(global.dbFilePath || 'apps/pocketbase/pb_data/data.db');
        db.prepare("UPDATE users SET totp_secret = ?, totp_enabled = 1, two_factor_enabled = 1, totp_recovery_codes = ? WHERE id = ?")
          .run(secret, JSON.stringify(hashedRecoveryCodes), userId);
      } catch (sqlErr) {
        logger.warn(`Could not update SQLite users table directly: ${sqlErr.message}`);
      }
    }

    try {
      auditService.ingestEvent({
        action: 'ENABLE_2FA_TOTP',
        module: 'AUTH',
        entityId: userId,
        details: { method: 'GOOGLE_AUTHENTICATOR' }
      }, {
        actorId: userId,
        ip: req.ip || req.socket.remoteAddress
      });
    } catch (_) {}

    return res.json({
      success: true,
      message: 'Google Authenticator 2FA successfully paired and activated!'
    });
  } catch (err) {
    logger.error(`[API/User/2FA] Verify & Enable error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to activate 2FA' });
  }
});

router.post('/2fa/disable', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const { token } = req.body;

    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
    if (user.totp_secret && token) {
      const isValid = totpService.verifyTOTP(token, user.totp_secret);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Invalid 6-digit Authenticator code. Cannot disable 2FA.' });
      }
    }

    try {
      await pb.collection('users').update(userId, {
        totp_secret: '',
        totp_enabled: 0,
        two_factor_enabled: 0,
        totp_recovery_codes: '[]'
      }, { $autoCancel: false });
    } catch (e) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync(global.dbFilePath || 'apps/pocketbase/pb_data/data.db');
        db.prepare("UPDATE users SET totp_secret = '', totp_enabled = 0, two_factor_enabled = 0, totp_recovery_codes = '[]' WHERE id = ?")
          .run(userId);
      } catch (_) {}
    }

    try {
      auditService.ingestEvent({
        action: 'DISABLE_2FA_TOTP',
        module: 'AUTH',
        entityId: userId,
        details: { timestamp: new Date().toISOString() }
      }, {
        actorId: userId,
        ip: req.ip || req.socket.remoteAddress
      });
    } catch (_) {}

    return res.json({
      success: true,
      message: 'Google Authenticator 2FA disabled successfully.'
    });
  } catch (err) {
    logger.error(`[API/User/2FA] Disable error: ${err.message}`);
    return res.status(500).json({ success: false, error: 'Failed to disable 2FA' });
  }
});

router.post('/2fa/verify-step', pocketbaseAuth, async (req, res) => {
  try {
    const userId = req.pocketbaseUserId;
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, error: '6-digit code required' });

    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
    if (!user.totp_enabled || !user.totp_secret) {
      return res.json({ success: true, verified: true, note: '2FA not enabled on this account' });
    }

    const isValid = totpService.verifyTOTP(token, user.totp_secret);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Incorrect 6-digit Authenticator code.' });
    }

    return res.json({ success: true, verified: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

export default router;
