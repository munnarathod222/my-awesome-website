import rateLimit from 'express-rate-limit';

export const globalRateLimit = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 10000,
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.path.startsWith('/hcgi/'),
	message: { error: 'Too many requests, please try again later' },
	validate: { trustProxy: false },
});