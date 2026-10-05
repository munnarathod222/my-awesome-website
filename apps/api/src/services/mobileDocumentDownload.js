import { MobileDataError } from './mobileDriverData.js';

export function documentMime(bytes) {
  if (bytes.subarray(0, 5).toString() === '%PDF-') return 'application/pdf';
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}
// Use Express's existing local/Supabase-backed file route, not PocketBase's
// filesystem-only endpoint. Ownership has already been checked by data.file().
export async function downloadMobileDocument(row, name, { fetcher = fetch, port = process.env.PORT || '3001' } = {}) {
  const collection = row.collectionId || row.collectionName;
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(collection || '') || !/^[a-zA-Z0-9_-]{1,64}$/.test(row.id || '') ||
      !name || /[\/\\\x00-\x1f]/.test(name) || !/^\d{1,5}$/.test(String(port)) || Number(port) > 65535 || Number(port) < 1)
    throw new MobileDataError(503, 'FILE_UNAVAILABLE', 'Document storage is unavailable.');
  const url = `http://127.0.0.1:${port}/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(row.id)}/${encodeURIComponent(name)}`;
  const reply = await fetcher(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!reply.ok || !reply.body) {
    await reply.body?.cancel();
    throw new MobileDataError(reply.status === 404 ? 404 : 503, 'FILE_UNAVAILABLE', 'The document file could not be retrieved from website storage.');
  }
  const limit = 20 * 1024 * 1024;
  if (Number(reply.headers.get('content-length')) > limit) {
    await reply.body.cancel(); throw new MobileDataError(413, 'FILE_TOO_LARGE', 'Document exceeds 20 MB.');
  }
  const chunks = []; let size = 0;
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
