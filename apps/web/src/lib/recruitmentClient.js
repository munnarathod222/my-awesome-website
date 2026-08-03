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

export async function getApplications(filters = {}) {
  try {
    let filterStr = '';
    if (filters.status && filters.status !== 'all') {
      filterStr = `status = "${filters.status}"`;
    }
    const records = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      filter: filterStr || '',
      $autoCancel: false,
    }).catch(() => []);
    return records || [];
  } catch (err) {
    console.error('Failed to fetch applications:', err);
    return [];
  }
}

export async function submitApplication(formData, licenseFile) {
  const data = new FormData();
  Object.entries(formData).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') data.append(k, v);
  });
  data.append('status', 'Applied');
  data.append('applied_date', new Date().toISOString());
  if (licenseFile) {
    data.append('license_file', licenseFile);
  }
  return await pb.collection('driver_applications').create(data);
}

export async function updateApplicationStatus(id, status, notes = '') {
  return await pb.collection('driver_applications').update(id, { status, notes });
}

export async function deleteApplication(id) {
  return await pb.collection('driver_applications').delete(id);
}

export function getLicenseFileUrl(record) {
  if (!record || !record.license_file) return null;
  return pb.files.getURL(record, record.license_file);
}

export function getStatusConfig(status) {
  return APPLICATION_STATUSES.find(s => s.value === status) || APPLICATION_STATUSES[0];
}
