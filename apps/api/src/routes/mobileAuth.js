import express from 'express';
import * as driverAuthService from '../services/driverAuthService.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * Mobile Driver Authentication Middleware
 * Enforces strict JWT verification, password version checking (instant revocation),
 * account active status, and first-login password change gating.
 */
export const requireDriverAuth = (options = { allowMustChange: false }) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        error: 'Missing or malformed Authorization header. Expected Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    const verification = driverAuthService.verifyJwt(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        error: verification.error || 'Authentication token is invalid or expired'
      });
    }

    const payload = verification.payload;

    try {
      const db = driverAuthService.getDb();
      const acc = db.prepare(`
        SELECT id, employee_id, employee_code, password_version, account_status, must_change_password
        FROM driver_app_accounts
        WHERE employee_id = ?
      `).get(payload.sub);

      if (!acc) {
        return res.status(401).json({
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          error: 'Driver account no longer exists'
        });
      }

      if (acc.account_status !== 'active') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_DISABLED',
          error: 'Driver account is disabled. Contact dispatch office.'
        });
      }

      // Check session revocation via password_version
      if (acc.password_version !== payload.pver) {
        return res.status(401).json({
          success: false,
          code: 'SESSION_REVOKED',
          error: 'Your session has expired due to a password reset or security update. Please log in again.'
        });
      }

      // First-login restriction: If driver has not changed temporary password,
      // restrict access to change-password and logout only.
      if (acc.must_change_password && !options.allowMustChange) {
        return res.status(403).json({
          success: false,
          code: 'PASSWORD_CHANGE_REQUIRED',
          error: 'Temporary password detected. You must change your password before accessing driver services.'
        });
      }

      req.driverAuth = {
        accountId: acc.id,
        employeeId: acc.employee_id,
        employeeCode: acc.employee_code,
        mustChangePassword: Boolean(acc.must_change_password)
      };

      return next();
    } catch (err) {
      logger.error(`Driver auth error: ${err.message}`);
      return res.status(500).json({ success: false, error: 'Internal authentication validation failure' });
    }
  };
};

/**
 * POST /api/mobile/v1/auth/login
 * Driver login with permanent employeeCode (e.g. D001) and password
 */
router.post('/login', (req, res) => {
  const { employeeCode, password } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  try {
    const db = driverAuthService.getDb();
    const result = driverAuthService.authenticateLogin(db, { employeeCode, password, ip });
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || 400;
    return res.status(statusCode).json({
      success: false,
      code: statusCode === 429 ? 'ACCOUNT_LOCKED' : (statusCode === 403 ? 'ACCOUNT_DISABLED' : 'INVALID_CREDENTIALS'),
      error: err.message
    });
  }
});

/**
 * POST /api/mobile/v1/auth/change-password
 * First login password change or regular password update
 */
router.post('/change-password', requireDriverAuth({ allowMustChange: true }), (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  try {
    const db = driverAuthService.getDb();
    const result = driverAuthService.changeDriverPassword(db, {
      employeeId: req.driverAuth.employeeId,
      currentPassword,
      newPassword
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      code: 'PASSWORD_CHANGE_FAILED',
      error: err.message
    });
  }
});

/**
 * POST /api/mobile/v1/auth/refresh
 * Refresh session access token using valid refresh token
 */
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {};

  try {
    const db = driverAuthService.getDb();
    const result = driverAuthService.refreshSessionToken(db, { refreshToken });
    return res.status(200).json(result);
  } catch (err) {
    const statusCode = err.status || 400;
    return res.status(statusCode).json({
      success: false,
      code: 'REFRESH_FAILED',
      error: err.message
    });
  }
});

/**
 * POST /api/mobile/v1/auth/logout
 * Revoke driver session across all active devices
 */
router.post('/logout', requireDriverAuth({ allowMustChange: true }), (req, res) => {
  try {
    const db = driverAuthService.getDb();
    const result = driverAuthService.logoutDriver(db, { employeeId: req.driverAuth.employeeId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/mobile/v1/me
 * Authenticated driver profile, assigned truck, and supervisor details
 */
router.get('/me', requireDriverAuth({ allowMustChange: false }), (req, res) => {
  try {
    const db = driverAuthService.getDb();
    const profile = driverAuthService.getDriverProfile(db, req.driverAuth.employeeId);
    return res.status(200).json({
      success: true,
      driver: profile
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
