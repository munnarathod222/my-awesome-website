import rateLimit from 'express-rate-limit';

// Strict rate limiter for authentication routes (login, PIN verify, token generation)
// Protects against credential stuffing and brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Max 10 failed attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Do not punish users logging in with correct credentials
  keyGenerator: (req) => {
    return req.headers['cf-connecting-ip'] || 
           req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.ip || 
           req.socket.remoteAddress || 
           'unknown';
  },
  message: {
    success: false,
    error: 'Too many failed login attempts. Account temporarily locked for 15 minutes for security.',
    code: 'AUTH_RATE_LIMITED'
  },
  validate: { trustProxy: false }
});

// Rate limiter for public tracking queries to prevent scraping / enumeration
export const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 tracking lookups per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['cf-connecting-ip'] || 
           req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.ip || 
           req.socket.remoteAddress || 
           'unknown';
  },
  message: {
    success: false,
    error: 'Too many tracking requests. Please slow down.',
    code: 'TRACKING_RATE_LIMITED'
  },
  validate: { trustProxy: false }
});

export default {
  authLimiter,
  trackingLimiter
};
