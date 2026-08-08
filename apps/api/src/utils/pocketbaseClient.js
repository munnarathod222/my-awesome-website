import Pocketbase from 'pocketbase';
import logger from './logger.js';

const POCKETBASE_HOST = `http://localhost:8090`;

async function waitForHealth({ retries = 30, delayMs = 1000 } = {}) {
    for (let i = 1; i <= retries; i++) {
        try {
            const response = await fetch(`${POCKETBASE_HOST}/api/health`, { method: 'HEAD' });

            if (response.ok) {
                return;
            }
        } catch {
            // PocketBase not reachable yet; retry below
        }

        logger.warn(`PocketBase not ready, retrying (${i}/${retries})...`);

        await new Promise((r) => setTimeout(r, delayMs));
    }

    throw new Error(`PocketBase health check failed after ${retries} retries`);
}

const pocketbaseClient = new Pocketbase(POCKETBASE_HOST);

pocketbaseClient.autoCancellation(false);

const originalSend = pocketbaseClient.send.bind(pocketbaseClient);
pocketbaseClient.send = async function (path, sendOptions) {
    try {
        return await originalSend(path, sendOptions);
    } catch (err) {
        if ((err.status === 401 || err.status === 403) && !path.includes('/auth-with-password')) {
            logger.warn(`PocketBase request to ${path} returned 401/403. Re-authenticating superuser client...`);
            pocketbaseClient.authStore.clear();
            const email = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
            const password = process.env.PB_SUPERUSER_PASSWORD || 'Munnarathod@25';
            try {
                await pocketbaseClient.collection('_superusers').authWithPassword(email, password, { $autoCancel: false });
                logger.info(`Re-authentication successful. Retrying request: ${path}`);
                return await originalSend(path, sendOptions);
            } catch (authErr) {
                logger.error('Failed to re-authenticate PocketBase superuser client:', authErr);
                throw err;
            }
        }
        throw err;
    }
};

let authPromise = null;

pocketbaseClient.beforeSend = async function (url, options) {
    if (url.includes('/api/collections/') && url.includes('/auth-with-password')) {
        return { url, options };
    }

    if (!pocketbaseClient.authStore.isValid && !authPromise) {
        const email = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
        const password = process.env.PB_SUPERUSER_PASSWORD || 'Munnarathod@25';
        
        authPromise = (async () => {
            try {
                await pocketbaseClient.collection('_superusers').authWithPassword(email, password, { $autoCancel: false });
            } catch (e1) {
                try {
                    await pocketbaseClient.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'Munnarathod@25', { $autoCancel: false });
                } catch (e1_alt) {
                    try {
                        await pocketbaseClient.collection('users').authWithPassword('munnarathod222@gmail.com', 'Munnarathod@25', { $autoCancel: false });
                    } catch (e2) {}
                }
            }
        })().finally(() => {
            authPromise = null;
        });
    }

    if (authPromise) {
        await authPromise.catch(() => {});
    }

    return { url, options };
};

(async () => {
    try {
        await waitForHealth();
        if (!pocketbaseClient.authStore.isValid && !authPromise) {
            const email = process.env.PB_SUPERUSER_EMAIL || 'munnarathod222@gmail.com';
            const password = process.env.PB_SUPERUSER_PASSWORD || 'Munnarathod@25';
            
            authPromise = (async () => {
                try {
                    await pocketbaseClient.collection('_superusers').authWithPassword(email, password, { $autoCancel: false });
                } catch (e1) {
                    try {
                        await pocketbaseClient.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'Munnarathod@25', { $autoCancel: false });
                    } catch (e1_alt) {
                        try {
                            await pocketbaseClient.collection('users').authWithPassword('munnarathod222@gmail.com', 'Munnarathod@25', { $autoCancel: false });
                        } catch (e2) {}
                    }
                }
            })().finally(() => {
                authPromise = null;
            });
        }
        
        if (authPromise) {
            await authPromise.catch(() => {});
        }
        
        logger.info('PocketBase client initialized successfully');
    } catch (err) {
        logger.error('Failed to initialize PocketBase client:', err);
    }
})();

export default pocketbaseClient;
export { pocketbaseClient };
