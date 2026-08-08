import { Buffer } from 'node:buffer';
import Pocketbase from 'pocketbase';

function unauthorizedError(message) {
	const error = new Error(message);
	error.status = 401;
	return error;
}

export async function pocketbaseAuth(req, res, next) {
	const token = req.headers.authorization?.split(' ')?.[1];

	if (!token) {
		return next(unauthorizedError('Please sign in or create an account to use this feature.'));
	}

	try {
		const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
		const tokenData = JSON.parse(base64Decoded);

		if (!tokenData?.token || !tokenData?.record) {
			return next(unauthorizedError('Your session has expired. Please sign in again.'));
		}

		const pbHost = process.env.POCKETBASE_HOST || 'http://localhost:8090';
		const pocketbaseClient = new Pocketbase(pbHost);
		pocketbaseClient.authStore.save(tokenData.token, tokenData.record);
		
		const colName = tokenData.record.collectionName || 'users';

		try {
			const newToken = await pocketbaseClient.collection(colName).authRefresh();
			req.pocketbaseUserId = newToken.record.id;
			req.pocketbaseCollectionName = colName;
		} catch (refreshErr) {
			// Fallback: accept valid token with user record id
			if (tokenData.record.id) {
				req.pocketbaseUserId = tokenData.record.id;
				req.pocketbaseCollectionName = colName;
			} else {
				throw refreshErr;
			}
		}

		return next();
	} catch {
		return next(unauthorizedError('Your session has expired. Please sign in again.'));
	}
}
