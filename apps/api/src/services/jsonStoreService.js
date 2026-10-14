import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { isSupabaseCutoverActive, createSupabaseClient } from '../utils/supabaseClient.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');

/**
 * Multi-Store JSON Registry Service
 * Provides seamless access to all 23 inventoried JSON stores:
 * - In local/fallback mode: reads/writes to data/<storeKey>.json
 * - In Supabase mode (DATA_STORE=supabase): reads/writes to table jbc_json_stores
 */
export async function getJsonStore(storeKey) {
  const normKey = storeKey.endsWith('.json') ? storeKey : `${storeKey}.json`;

  if (isSupabaseCutoverActive()) {
    const sb = createSupabaseClient();
    if (!sb) {
      throw new Error(`[jsonStoreService] Supabase cutover active (DATA_STORE=supabase) but client initialization failed.`);
    }
    // Query jbc_json_stores by store_key primary key (not id)
    const res = await sb.request(`/rest/v1/jbc_json_stores?store_key=eq.${encodeURIComponent(normKey)}&select=*`, 'GET', null, {
      'Range': '0-0'
    });
    const rows = res.data;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].store_data ?? null;
    }
    // Record does not exist yet in Supabase
    return null;
  }

  // Fallback to local file in local mode only
  const localFile = path.join(DATA_DIR, normKey);
  try {
    if (fs.existsSync(localFile)) {
      return JSON.parse(fs.readFileSync(localFile, 'utf8'));
    }
  } catch (err) {
    console.warn(`[jsonStoreService] Local read failed for ${localFile}:`, err.message);
  }
  return null;
}

export async function saveJsonStore(storeKey, data) {
  const normKey = storeKey.endsWith('.json') ? storeKey : `${storeKey}.json`;
  const count = Array.isArray(data) ? data.length : (data && typeof data === 'object' ? Object.keys(data).length : 0);

  if (isSupabaseCutoverActive()) {
    const sb = createSupabaseClient();
    if (!sb) {
      throw new Error(`[jsonStoreService] Supabase cutover active (DATA_STORE=supabase) but Supabase credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are missing or invalid.`);
    }
    await sb.request('/rest/v1/jbc_json_stores', 'POST', {
      store_key: normKey,
      store_data: data,
      entry_count: count,
      updated_at: new Date().toISOString()
    }, {
      'Prefer': 'resolution=merge-duplicates,return=representation'
    });
    return true;
  }

  // Local file write
  const localFile = path.join(DATA_DIR, normKey);
  try {
    fs.mkdirSync(path.dirname(localFile), { recursive: true });
    const tmp = `${localFile}.tmp.${Date.now()}.${crypto.randomBytes(3).toString('hex')}`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    try {
      fs.renameSync(tmp, localFile);
    } catch (_) {
      if (fs.existsSync(localFile)) fs.unlinkSync(localFile);
      fs.renameSync(tmp, localFile);
    }
    return true;
  } catch (err) {
    console.error(`[jsonStoreService] Local write failed for ${localFile}:`, err.message);
    throw err;
  }
}
