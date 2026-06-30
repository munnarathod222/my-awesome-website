import pb from '@/lib/pocketbaseClient.js';

/**
 * Generates the URL for an employee's photo.
 * 
 * @param {Object} record - The PocketBase record object.
 * @param {boolean} thumb - Whether to request a thumbnail version.
 * @returns {string} The URL of the photo or a placeholder image.
 */
export const getEmployeePhotoUrl = (record, thumb = false) => {
  if (!record || !record.photo) {
    // Return a generic SVG placeholder if no photo exists
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  }
  
  const options = thumb ? { thumb: '100x100' } : {};
  return pb.files.getUrl(record, record.photo, options);
};