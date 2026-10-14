import fs from 'node:fs';
import path from 'node:path';
import { MobileDataError } from './mobileDriverData.js';

export function documentMime(bytes) {
  if (bytes.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

// Serves documents from private local storage or website storage endpoint.
// Ownership has already been checked by data.file().
export async function downloadMobileDocument(row, name, { fetcher = fetch, port = process.env.PORT || '3001' } = {}) {
  const collection = row.collectionId || row.collectionName || 'trip_logs';
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(collection || '') || !/^[a-zA-Z0-9_-]{1,64}$/.test(row.id || '') ||
      !name || /[\/\\\x00-\x1f]/.test(name) || !/^\d{1,5}$/.test(String(port)) || Number(port) > 65535 || Number(port) < 1) {
    throw new MobileDataError(503, 'FILE_UNAVAILABLE', 'Document storage is unavailable.');
  }

  // 1. Check local private storage directories on disk first
  const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
  const candidateDirs = [
    path.join(dataDir, 'private_storage', collection, row.id),
    path.resolve(process.cwd(), 'data', 'private_storage', collection, row.id),
    path.resolve(process.cwd(), 'apps/pocketbase/pb_data/storage', collection, row.id),
    path.resolve(process.cwd(), 'pb_data/storage', collection, row.id)
  ];

  for (const dir of candidateDirs) {
    try {
      const filePath = path.join(dir, name);
      if (fs.existsSync(filePath)) {
        const bytes = fs.readFileSync(filePath);
        const type = documentMime(bytes);
        if (!type) throw new MobileDataError(415, 'FILE_TYPE_UNSUPPORTED', 'This file is missing or is not a supported PDF/image.');
        return { bytes, type };
      }
    } catch (err) {
      if (err instanceof MobileDataError) throw err;
    }
  }

  // 2. Fallback to website HTTP file route
  const url = `http://127.0.0.1:${port}/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(row.id)}/${encodeURIComponent(name)}`;
  let reply;
  try {
    reply = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  } catch (_) {
    throw new MobileDataError(503, 'FILE_UNAVAILABLE', 'Document storage is unavailable.');
  }

  if (!reply.ok || !reply.body) {
    await reply.body?.cancel();
    throw new MobileDataError(reply.status === 404 ? 404 : 503, 'FILE_UNAVAILABLE', 'The document file could not be retrieved from website storage.');
  }

  const limit = 20 * 1024 * 1024;
  if (Number(reply.headers.get('content-length')) > limit) {
    await reply.body.cancel();
    throw new MobileDataError(413, 'FILE_TOO_LARGE', 'Document exceeds 20 MB.');
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of reply.body) {
    size += chunk.length;
    if (size > limit) throw new MobileDataError(413, 'FILE_TOO_LARGE', 'Document exceeds 20 MB.');
    chunks.push(chunk);
  }

  const bytes = Buffer.concat(chunks);
  const type = documentMime(bytes);
  if (!type) throw new MobileDataError(415, 'FILE_TYPE_UNSUPPORTED', 'This file is missing or is not a supported PDF/image.');
  return { bytes, type };
}
