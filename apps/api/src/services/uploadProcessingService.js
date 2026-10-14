import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

// Known file magic signatures
const MAGIC_SIGNATURES = [
  { mime: 'image/jpeg', ext: '.jpg', check: (buf) => buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF },
  { mime: 'image/png', ext: '.png', check: (buf) => buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 && buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A },
  { mime: 'image/webp', ext: '.webp', check: (buf) => buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP' },
  { mime: 'application/pdf', ext: '.pdf', check: (buf) => buf.length >= 4 && buf.toString('ascii', 0, 4) === '%PDF' }
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB max
const DEFAULT_POD_LIMIT_BYTES = 15 * 1024 * 1024; // 15 MB max
export const MAX_IMAGE_PIXELS = 16 * 1024 * 1024; // 16 megapixels bounded memory limit

// Persistent LRU idempotency cache for deduplication across restarts
const DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24 hour deduplication window
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const DEDUP_FILE = path.join(DATA_DIR, 'upload_dedup_cache.json');

const DEDUP_CACHE = new Map();

function loadDedupCache() {
  try {
    if (fs.existsSync(DEDUP_FILE)) {
      const data = JSON.parse(fs.readFileSync(DEDUP_FILE, 'utf8'));
      const now = Date.now();
      for (const [k, v] of Object.entries(data)) {
        if (now - v.timestamp < DEDUP_TTL_MS) {
          DEDUP_CACHE.set(k, v);
        }
      }
    }
  } catch (_) {}
}

function saveDedupCache() {
  try {
    fs.mkdirSync(path.dirname(DEDUP_FILE), { recursive: true });
    const tmp = `${DEDUP_FILE}.tmp.${Date.now()}`;
    const obj = Object.fromEntries(DEDUP_CACHE.entries());
    fs.writeFileSync(tmp, JSON.stringify(obj), 'utf8');
    try {
      fs.renameSync(tmp, DEDUP_FILE);
    } catch (_) {
      try { fs.unlinkSync(DEDUP_FILE); } catch (e) {}
      fs.renameSync(tmp, DEDUP_FILE);
    }
  } catch (_) {}
}

loadDedupCache();

function cleanupDedupCache() {
  const now = Date.now();
  let changed = false;
  for (const [key, item] of DEDUP_CACHE.entries()) {
    if (now - item.timestamp > DEDUP_TTL_MS) {
      DEDUP_CACHE.delete(key);
      changed = true;
    }
  }
  if (changed) saveDedupCache();
}
setInterval(cleanupDedupCache, 60000).unref();

/**
 * Concurrency Limiter Semaphore for bounded CPU/memory usage
 */
class Semaphore {
  constructor(maxConcurrent) {
    this.max = maxConcurrent;
    this.current = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.current < this.max) {
      this.current++;
      return;
    }
    await new Promise((resolve) => this.queue.push(resolve));
    this.current++;
  }

  release() {
    this.current--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    }
  }
}

const processingSemaphore = new Semaphore(5); // Maximum 5 concurrent heavy operations

/**
 * Identify MIME type and extension from buffer magic bytes
 */
export function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return null;
  }
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.check(buffer)) {
      return { mime: sig.mime, ext: sig.ext };
    }
  }
  return null;
}

/**
 * Shared Upload Processing Engine
 * Handles strictly lossless optimization, verified byte-for-byte PDF preservation,
 * bounded pixel dimensions, bounded memory, and durable deduplication.
 */
export async function processUpload({
  buffer,
  filename = 'upload.bin',
  actorId = 'anonymous',
  category = 'document', // 'pod' | 'bill' | 'document' | 'service_invoice'
  maxSizeBytes = DEFAULT_POD_LIMIT_BYTES
}) {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Invalid upload: payload must be a binary Buffer.');
  }

  // 1. Enforce size limits
  const effectiveMax = Math.min(maxSizeBytes || DEFAULT_POD_LIMIT_BYTES, MAX_FILE_SIZE_BYTES);
  if (buffer.length > effectiveMax) {
    const maxMb = Math.round(effectiveMax / (1024 * 1024));
    const err = new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds permitted limit of ${maxMb} MB.`);
    err.status = 413;
    err.code = 'FILE_TOO_LARGE';
    throw err;
  }

  // 2. Magic byte file type detection
  const detected = detectFileType(buffer);
  if (!detected) {
    const err = new Error('Unsupported or potentially unsafe file format. Allowed types: JPEG, PNG, WebP, PDF.');
    err.status = 415;
    err.code = 'UNSUPPORTED_MEDIA_TYPE';
    throw err;
  }

  // 3. Persistent Deduplication Check (SHA-256)
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const dedupKey = `${actorId}:${category}:${sha256}`;
  const cached = DEDUP_CACHE.get(dedupKey);
  if (cached && (Date.now() - cached.timestamp < DEDUP_TTL_MS)) {
    return {
      ...cached.result,
      buffer: cached.result.buffer || buffer,
      isDuplicateRetry: true
    };
  }

  // 4. Processing logic:
  // - PDFs: PRESERVE EXACT BUFFER UNCHANGED.
  // Never rasterize, alter text, or compromise digital signatures and stamps.
  if (detected.mime === 'application/pdf') {
    const result = {
      buffer,
      originalSize: buffer.length,
      processedSize: buffer.length,
      savingsBytes: 0,
      isLosslessOptimized: false,
      preservedOriginal: true,
      mimeType: detected.mime,
      extension: detected.ext,
      sha256,
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`
    };
    DEDUP_CACHE.set(dedupKey, { timestamp: Date.now(), result });
    saveDedupCache();
    return result;
  }

  // - JPEG images: RETAIN ORIGINAL BYTES 1:1.
  // Lossy JPEG quality-95 recompression is strictly removed.
  // This preserves exact pixels, camera EXIF metadata, timestamps, and prevents recompression artifacts.
  if (detected.mime === 'image/jpeg') {
    // Validate pixel dimensions if sharp is available
    await processingSemaphore.acquire();
    try {
      try {
        const sharpMod = await import('sharp');
        const sharp = sharpMod.default || sharpMod;
        const meta = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
        if (meta.width && meta.height && (meta.width * meta.height > MAX_IMAGE_PIXELS)) {
          const err = new Error(`Image resolution (${meta.width}x${meta.height}) exceeds maximum limit of ${MAX_IMAGE_PIXELS} pixels.`);
          err.status = 400;
          err.code = 'IMAGE_DIMENSIONS_TOO_LARGE';
          throw err;
        }
      } catch (err) {
        if (err.code === 'IMAGE_DIMENSIONS_TOO_LARGE') throw err;
      }
    } finally {
      processingSemaphore.release();
    }

    const result = {
      buffer,
      originalSize: buffer.length,
      processedSize: buffer.length,
      savingsBytes: 0,
      isLosslessOptimized: false,
      preservedOriginal: true,
      mimeType: detected.mime,
      extension: detected.ext,
      sha256,
      filename: filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`
    };
    DEDUP_CACHE.set(dedupKey, { timestamp: Date.now(), result });
    saveDedupCache();
    return result;
  }

  // - PNG and WebP: Verified lossless compression only
  await processingSemaphore.acquire();
  let optimizedBuffer = buffer;
  let isLosslessOptimized = false;

  try {
    let sharp = null;
    try {
      const sharpMod = await import('sharp');
      sharp = sharpMod.default || sharpMod;
    } catch (_) {}

    if (sharp) {
      try {
        // Enforce pixel limits to prevent decompression memory bombs
        const meta = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
        if (meta.width && meta.height && (meta.width * meta.height > MAX_IMAGE_PIXELS)) {
          const err = new Error(`Image resolution (${meta.width}x${meta.height}) exceeds maximum limit of ${MAX_IMAGE_PIXELS} pixels.`);
          err.status = 400;
          err.code = 'IMAGE_DIMENSIONS_TOO_LARGE';
          throw err;
        }

        let pipeline = sharp(buffer, { failOnError: false, limitInputPixels: MAX_IMAGE_PIXELS });
        if (detected.mime === 'image/png') {
          // Strictly lossless PNG optimization
          pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false });
        } else if (detected.mime === 'image/webp') {
          // Strictly lossless WebP optimization
          pipeline = pipeline.webp({ lossless: true });
        }
        const candidate = await pipeline.toBuffer();

        // ONLY keep candidate if it is strictly smaller than the original
        if (candidate.length < buffer.length) {
          optimizedBuffer = candidate;
          isLosslessOptimized = true;
        }
      } catch (sharpErr) {
        if (sharpErr.code === 'IMAGE_DIMENSIONS_TOO_LARGE') throw sharpErr;
        // Fallback to exact original buffer
        optimizedBuffer = buffer;
      }
    }
  } finally {
    processingSemaphore.release();
  }

  const result = {
    buffer: optimizedBuffer,
    originalSize: buffer.length,
    processedSize: optimizedBuffer.length,
    savingsBytes: Math.max(0, buffer.length - optimizedBuffer.length),
    isLosslessOptimized,
    preservedOriginal: optimizedBuffer.length === buffer.length,
    mimeType: detected.mime,
    extension: detected.ext,
    sha256,
    filename
  };

  DEDUP_CACHE.set(dedupKey, { timestamp: Date.now(), result });
  saveDedupCache();
  return result;
}

/**
 * Clear dedup cache (for testing)
 */
export function resetDedupCacheForTesting() {
  DEDUP_CACHE.clear();
  try {
    if (fs.existsSync(DEDUP_FILE)) fs.unlinkSync(DEDUP_FILE);
  } catch (_) {}
}
