import pb from './pocketbaseClient.js';

export const APPLICATION_STATUSES = [
  { value: 'Applied',     label: 'Applied',      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'Shortlisted', label: 'Shortlisted',  color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  { value: 'Interview',   label: 'Interview',    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'Selected',    label: 'Selected ✓',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'Rejected',    label: 'Rejected',     color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  { value: 'On Hold',     label: 'On Hold',      color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
];

export const VEHICLE_TYPES = [
  '20 FT Single Axle Truck',
  '32 FT Multi-Axle Truck',
  '40 FT Heavy Trailer',
  'Container Truck',
  'Reefer / Refrigerated Truck',
  'Tanker Truck',
  'Mini Truck / Tempo',
  'Auto Tipping / Tipper',
];

const LOCAL_STORAGE_KEY = 'jbc_driver_applications';

function getLocalApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalApplications(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export async function getApplications(filters = {}) {
  let pbRecords = [];
  try {
    let filterStr = '';
    if (filters.status && filters.status !== 'all') {
      filterStr = `status = "${filters.status}"`;
    }
    pbRecords = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      filter: filterStr || '',
      $autoCancel: false,
    }).catch(() => []);
  } catch (err) {
    console.warn('PocketBase getApplications fetch failed, using local backup:', err);
  }

  const localRecords = getLocalApplications();

  // Merge PocketBase + LocalStorage deduplicating by ID or full_name+phone
  const mergedMap = new Map();
  
  // 1. Add local records first
  localRecords.forEach(rec => {
    if (rec && rec.id) mergedMap.set(rec.id, rec);
  });

  // 2. Add/Override with PocketBase records
  pbRecords.forEach(rec => {
    if (rec && rec.id) mergedMap.set(rec.id, rec);
  });

  let allList = Array.from(mergedMap.values());

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    allList = allList.filter(a => a.status === filters.status);
  }

  // Sort newest first
  allList.sort((a, b) => {
    const dateA = new Date(a.applied_date || a.created || 0);
    const dateB = new Date(b.applied_date || b.created || 0);
    return dateB - dateA;
  });

  return allList;
}

export async function submitApplication(formData, files = {}) {
  let createdRecord = null;
  const appliedDate = new Date().toISOString();

  // 1. Try PocketBase create
  try {
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') data.append(k, v);
    });
    data.append('status', 'Applied');
    data.append('applied_date', appliedDate);

    const license = files instanceof File ? files : files.licenseFile;
    if (license) data.append('license_file', license);
    if (files.photoFile) data.append('photo_file', files.photoFile);
    if (files.panFile) data.append('pan_file', files.panFile);

    createdRecord = await pb.collection('driver_applications').create(data, { $autoCancel: false });
  } catch (err) {
    console.warn('PocketBase application submission failed/restricted, saving locally:', err);
  }

  // 2. Fallback / Sync to LocalStorage
  const localRecord = createdRecord ? { ...createdRecord } : {
    id: `app-${Date.now()}`,
    ...formData,
    status: 'Applied',
    applied_date: appliedDate,
    created: appliedDate,
    license_file_name: files.licenseFile?.name || '',
    photo_file_name: files.photoFile?.name || '',
    pan_file_name: files.panFile?.name || ''
  };

  const existingLocal = getLocalApplications();
  saveLocalApplications([localRecord, ...existingLocal.filter(l => l.id !== localRecord.id)]);

  return localRecord;
}

export async function updateApplicationStatus(id, status, notes = '') {
  // Update in LocalStorage
  const localList = getLocalApplications();
  const updatedLocal = localList.map(r => r.id === id ? { ...r, status, notes } : r);
  saveLocalApplications(updatedLocal);

  // Try updating in PocketBase
  try {
    return await pb.collection('driver_applications').update(id, { status, notes }, { $autoCancel: false });
  } catch (err) {
    console.warn('PocketBase update failed, updated in local cache:', err);
    return updatedLocal.find(r => r.id === id);
  }
}

export async function deleteApplication(id) {
  // Delete from LocalStorage
  const localList = getLocalApplications();
  saveLocalApplications(localList.filter(r => r.id !== id));

  // Try deleting from PocketBase
  try {
    return await pb.collection('driver_applications').delete(id, { $autoCancel: false });
  } catch (err) {
    console.warn('PocketBase delete failed, removed from local cache:', err);
    return true;
  }
}

export function getLicenseFileUrl(record) {
  if (!record) return null;
  if (record.license_file) {
    return pb.files.getURL(record, record.license_file);
  }
  return null;
}

export function getPhotoFileUrl(record) {
  if (!record) return null;
  const file = record.photo_file || record.passport_photo || record.photo;
  if (file && typeof file === 'string' && !file.startsWith('data:')) {
    return pb.files.getURL(record, file);
  }
  return null;
}

export function getPanFileUrl(record) {
  if (!record) return null;
  const file = record.pan_file || record.pan_card_file || record.pan_doc;
  if (file && typeof file === 'string' && !file.startsWith('data:')) {
    return pb.files.getURL(record, file);
  }
  return null;
}

export function getStatusConfig(status) {
  return APPLICATION_STATUSES.find(s => s.value === status) || APPLICATION_STATUSES[0];
}
