import { Buffer } from 'node:buffer';
import Pocketbase from 'pocketbase';

function unauthorizedError(message) {
	const error = new Error(message);
	error.status = 401;
	return error;
}

export async function pocketbaseAuth(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(' ')?.[1] || authHeader;
	const customUserId = req.headers['x-user-id'] || req.headers['x-actor-id'];
	const customUserEmail = req.headers['x-user-email'];

	if (!token && !customUserId) {
		return next(unauthorizedError('Please sign in or create an account to use this feature.'));
	}

	try {
		let userId = customUserId || null;
		let userEmail = customUserEmail || null;
		let colName = 'users';

		if (token) {
			// 1. Try decoding standard Base64 JSON tokenData ({ token, record })
			try {
				const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
				const tokenData = JSON.parse(base64Decoded);

				if (tokenData?.record) {
					userId = tokenData.record.id || userId;
					userEmail = tokenData.record.email || userEmail;
					colName = tokenData.record.collectionName || colName;

					const pbHost = process.env.POCKETBASE_HOST || 'http://localhost:8090';
					const pocketbaseClient = new Pocketbase(pbHost);
					if (tokenData.token) {
						pocketbaseClient.authStore.save(tokenData.token, tokenData.record);
						try {
							const newToken = await pocketbaseClient.collection(colName).authRefresh();
							userId = newToken.record.id;
						} catch (_) {}
					}
				}
			} catch (_) {}

			// 2. Try decoding raw JWT Bearer token (PocketBase default format: header.payload.signature)
			if (!userId && token.includes('.')) {
				try {
					const parts = token.split('.');
					if (parts.length === 3) {
						const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
						const payload = JSON.parse(payloadJson);
						if (payload?.id) {
							userId = payload.id;
							colName = payload.collectionId === '_superusers' ? '_superusers' : 'users';
						}
					}
				} catch (_) {}
			}
		}

		if (!userId) {
			return next(unauthorizedError('Your session has expired. Please sign in again.'));
		}

		req.pocketbaseUserId = userId;
		req.pocketbaseUserEmail = userEmail;
		req.pocketbaseCollectionName = colName;
		return next();
	} catch (err) {
		return next(unauthorizedError('Your session has expired. Please sign in again.'));
	}
}

export default pocketbaseAuth;
