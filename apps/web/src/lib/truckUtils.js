/**
 * Utility functions for Truck numbering, formatting, and images
 */

/**
 * Safely parses body_images field into a clean array of image filenames
 * @param {Array|string} bodyImages 
 * @returns {string[]} Array of clean image filenames
 */
export const parseTruckImages = (bodyImages) => {
  if (!bodyImages) return [];
  if (Array.isArray(bodyImages)) {
    return bodyImages.filter(f => f && typeof f === 'string' && f !== '[' && f !== ']');
  }
  if (typeof bodyImages === 'string') {
    const trimmed = bodyImages.trim();
    if (!trimmed || trimmed === '[]' || trimmed === 'null' || trimmed === 'undefined') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(f => f && typeof f === 'string' && f !== '[' && f !== ']');
      }
    } catch (e) {
      if (trimmed.includes(',')) {
        return trimmed.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(f => f && f !== '[' && f !== ']');
      }
      if (trimmed !== '[' && trimmed !== ']') {
        return [trimmed];
      }
    }
  }
  return [];
};

/**
 * Constructs direct, safe image URL for PocketBase truck images
 * @param {Object} truck 
 * @param {string} [filename] 
 * @param {string} [thumb] e.g. '100x100' or '200x120'
 * @returns {string|null}
 */
export const getTruckImageUrl = (truck, filename, thumb = '') => {
  if (!truck || !truck.id) return null;
  const rawFile = filename || (parseTruckImages(truck.body_images)[0]);
  if (!rawFile || rawFile === '[' || rawFile === ']') return null;
  const col = truck.collectionId || truck.collectionName || 'pbc_4061015685';
  const thumbParam = thumb ? `?thumb=${thumb}` : '';
  return `/hcgi/platform/api/files/${col}/${truck.id}/${rawFile}${thumbParam}`;
};

/**
 * Returns formatted truck display text with serial number #1, #2, #3...
 * Once assigned to a truck, the number is permanent and NEVER changes.
 * @param {Object} truck Truck object
 * @param {number} [index] Optional fallback
 * @returns {string} e.g. "#1 • TG12U2637"
 */
export const formatTruckLabel = (truck, index = 0) => {
  if (!truck) return '—';
  const num = getTruckSequenceNumber(truck, index);
  const plate = truck.truck_number || truck.plate || 'No Plate';
  return `#${num} • ${plate}`;
};

/**
 * Returns just the sequential truck number as a number or badge string
 * @param {Object} truck 
 * @param {number} [index] 
 * @returns {number} e.g. 1, 2, 3
 */
export const getTruckSequenceNumber = (truck, index = 0) => {
  if (!truck) return index + 1;
  if (truck.truck_sequence && Number(truck.truck_sequence) > 0) {
    return Number(truck.truck_sequence);
  }
  if (truck.unit_number && Number(truck.unit_number) > 0) {
    return Number(truck.unit_number);
  }
  const rawCode = String(truck.truck_code || truck.code || '').trim();
  const match = rawCode.match(/\d+/);
  if (match) {
    return parseInt(match[0], 10);
  }
  if (truck.sequential_number && Number(truck.sequential_number) > 0) {
    return Number(truck.sequential_number);
  }
  return index + 1;
};

/**
 * Returns just the sequential truck number/badge text
 * @param {Object} truck 
 * @param {number} index 
 * @returns {string} e.g. "#1"
 */
export const getTruckNumberBadge = (truck, index = 0) => {
  if (!truck) return '#';
  const num = getTruckSequenceNumber(truck, index);
  return `#${num}`;
};

/**
 * Enhances list of trucks by attaching stable 1-based sequential number & clean parsed image array.
 * Deterministically orders by `created ASC` (or id) for any unassigned trucks so numbers NEVER shift.
 */
export const enhanceTrucksWithNumbers = (truckList = []) => {
  if (!Array.isArray(truckList)) return [];

  // Build a deterministic mapping for trucks lacking a stored truck_sequence
  // Sort by created ASC so oldest registered truck is always #1, next is #2, etc.
  const sortedChronologically = [...truckList].sort((a, b) => {
    const timeA = a.created ? new Date(a.created).getTime() : (a.id || '').localeCompare(b.id || '');
    const timeB = b.created ? new Date(b.created).getTime() : (a.id || '').localeCompare(b.id || '');
    return timeA - timeB;
  });

  const fallbackMap = new Map();
  sortedChronologically.forEach((t, i) => {
    if (t && t.id) {
      fallbackMap.set(t.id, i + 1);
    }
  });

  return truckList.map((truck, idx) => {
    const parsedImages = parseTruckImages(truck.body_images);
    const primaryImgUrl = parsedImages.length > 0 ? getTruckImageUrl(truck, parsedImages[0]) : null;
    
    let seqNum;
    if (truck.truck_sequence && Number(truck.truck_sequence) > 0) {
      seqNum = Number(truck.truck_sequence);
    } else if (truck.id && fallbackMap.has(truck.id)) {
      seqNum = fallbackMap.get(truck.id);
    } else {
      seqNum = getTruckSequenceNumber(truck, idx);
    }

    const enhanced = {
      ...truck,
      collectionId: truck.collectionId || 'pbc_4061015685',
      collectionName: truck.collectionName || 'trucks',
      body_images: parsedImages,
      primary_image_url: primaryImgUrl,
      truck_sequence: seqNum,
      sequential_number: seqNum,
      display_label: `#${seqNum} • ${truck.truck_number || truck.plate || 'No Plate'}`
    };

    return enhanced;
  });
};
