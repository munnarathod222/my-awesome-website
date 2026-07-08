import pb from './pocketbaseClient.js';

const API_SERVER_URL = '/hcgi/api';

/**
 * Builds the base64-encoded Bearer token that pocketbase-auth.js middleware expects.
 * The middleware decodes it and verifies with PocketBase via authRefresh.
 * Format: Authorization: Bearer <base64(JSON.stringify({ token, record }))>
 */
function getAuthHeader() {
  if (!pb.authStore.isValid || !pb.authStore.token || !pb.authStore.model) {
    return {};
  }
  try {
    const tokenPayload = JSON.stringify({
      token: pb.authStore.token,
      record: pb.authStore.model,
    });
    // Use encodeURIComponent + unescape to safely handle unicode characters before btoa
    const encoded = btoa(unescape(encodeURIComponent(tokenPayload)));
    return { Authorization: `Bearer ${encoded}` };
  } catch (err) {
    console.error('[apiServerClient] Failed to encode auth token:', err);
    return {};
  }
}

const apiServerClient = {
  fetch: async (url, options = {}) => {
    const authHeader = getAuthHeader();
    const mergedHeaders = {
      ...authHeader,
      ...(options.headers || {}),
    };
    return await window.fetch(API_SERVER_URL + url, {
      ...options,
      headers: mergedHeaders,
    });
  },
};

export default apiServerClient;

export { apiServerClient };
