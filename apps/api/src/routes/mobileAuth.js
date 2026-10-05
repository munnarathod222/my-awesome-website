import pb from '../utils/pocketbaseClient.js';
import { mountMobileDriverData } from './mobileDriverData.js';
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
    let verification;
    try {
      verification = driverAuthService.verifyJwt(token);
    } catch (cfgErr) {
      logger.error(`Driver JWT verification configuration error: ${cfgErr.message}`);
      return res.status(500).json({
        success: false,
        code: 'CONFIG_ERROR',
        error: 'Server authentication configuration error'
      });
    }

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        error: verification.error || 'Authentication token is invalid or expired'
      });
    }

    const payload = verification.payload;

    // Enforce distinct token types: protected routes require an access token
    if (payload.type !== 'access') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_TYPE_INVALID',
        error: 'Invalid token type: Protected routes require an access token'
      });
    }

    try {
      const acc = driverAuthService.findAccountByEmployeeId(payload.sub);

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
 * POST /login and /auth/login
 * Driver login with permanent employeeCode (e.g. D001) and password
 */
router.post(['/login', '/auth/login'], (req, res) => {
  const { employeeCode, password } = req.body || {};
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  try {
    const result = driverAuthService.authenticateLogin(null, { employeeCode, password, ip });
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
 * POST /change-password and /auth/change-password
 * First login password change or regular password update
 */
router.post(['/change-password', '/auth/change-password'], requireDriverAuth({ allowMustChange: true }), (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  try {
    const result = driverAuthService.changeDriverPassword(null, {
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
 * POST /refresh and /auth/refresh
 * Refresh session access token using valid refresh token
 */
router.post(['/refresh', '/auth/refresh'], (req, res) => {
  const { refreshToken } = req.body || {};

  try {
    const result = driverAuthService.refreshSessionToken(null, { refreshToken });
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
 * POST /logout and /auth/logout
 * Revoke driver session across all active devices
 */
router.post(['/logout', '/auth/logout'], requireDriverAuth({ allowMustChange: true }), (req, res) => {
  try {
    const result = driverAuthService.logoutDriver(null, { employeeId: req.driverAuth.employeeId });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /me and /auth/me
 * Authenticated driver profile, assigned truck, and supervisor details
 */
router.get(['/me', '/auth/me'], requireDriverAuth({ allowMustChange: false }), (req, res) => {
  try {
    const profile = driverAuthService.getDriverProfile(null, req.driverAuth.employeeId);
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

mountMobileDriverData(router, requireDriverAuth, pb);

export default router;
