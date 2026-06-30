import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

/**
 * Express Middleware to enforce strict financial lockdown and delegation.
 * @param {string} resourceName - The financial module name (e.g., 'payroll', 'cashbook')
 */
export const enforceFinancialLockdown = (resourceName) => {
  return async (req, res, next) => {
    const userId = req.pocketbaseUserId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Fetch fresh user role from database
      const user = await pb.collection('users').getOne(userId, { $autoCancel: false });
      const role = user.role || 'user';
      const email = user.email || userId;

      // 1. Rule: Admins and Super Admins bypass checks (Full Access)
      if (role === 'admin' || role === 'super_admin') {
        return next();
      }

      // 2. Rule: Hard lockout check for restricted roles
      if (role === 'supervisor' || role === 'dispatcher') {
        try {
          // Check for active override
          const override = await pb.collection('user_permission_overrides').getFirstListItem(
            `user_id = "${userId}" && resource = "${resourceName}" && is_allowed = true`,
            { $autoCancel: false }
          );

          if (override) {
            const logMsg = `[OVERRIDE ACCESS] User ${email} (Role: ${role}) accessed Financial Module: ${resourceName}`;
            logger.info(logMsg);

            // Log entry in audit_logs
            await pb.collection('audit_logs').create({
              user_id: userId,
              action: req.method,
              resource_type: resourceName,
              details: logMsg,
              ip_address: req.ip || req.headers['x-forwarded-for'] || ''
            }, { $autoCancel: false });

            return next();
          }
        } catch (err) {
          if (err.status !== 404) {
            logger.error(`Database error checking override for user ${userId}: ${err.message}`);
            return res.status(500).json({ error: 'Security validation failed' });
          }
        }

        // 3. Action: Lockout Trigger (Default Deny - No override found)
        const alertMsg = `[UNAUTHORIZED ACCESS ATTEMPT] User ${email} (Role: ${role}) attempted to access Financial Module: ${resourceName}`;
        logger.warn(alertMsg);

        try {
          await pb.collection('audit_logs').create({
            user_id: userId,
            action: req.method,
            resource_type: resourceName,
            details: `[HIGH SEVERITY ALERT] ${alertMsg}`,
            ip_address: req.ip || req.headers['x-forwarded-for'] || ''
          }, { $autoCancel: false });
        } catch (logErr) {
          logger.error(`Failed to write audit log alert: ${logErr.message}`);
        }

        return res.status(403).json({
          error: 'Access Denied: You do not have permission to access the Financial Module.'
        });
      }

      // 4. Default Deny for other roles
      return res.status(403).json({ error: 'Access Denied' });

    } catch (err) {
      logger.error(`Authentication error in enforceFinancialLockdown: ${err.message}`);
      return res.status(401).json({ error: 'Invalid authentication session' });
    }
  };
};
