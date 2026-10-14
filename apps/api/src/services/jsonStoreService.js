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
    try {
      const sb = createSupabaseClient();
      if (sb) {
        const row = await sb.collection('jbc_json_stores').getOne(normKey);
        if (row && row.store_data) {
          return row.store_data;
        }
      }
    } catch (err) {
      if (err.status !== 404) {
        console.warn(`[jsonStoreService] Supabase read failed for ${normKey}:`, err.message);
      }
    }
  }

  // Fallback to local file
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
    try {
      const sb = createSupabaseClient();
      if (sb) {
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
    } catch (err) {
      console.error(`[jsonStoreService] Supabase write failed for ${normKey}:`, err.message);
      throw err;
    }
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
