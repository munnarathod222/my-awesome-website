// Driver-only read access. Never query by a caller-supplied employee ID or a name.
export class MobileDataError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const fail = (status, code, message) => { throw new MobileDataError(status, code, message); };
const text = value => typeof value === 'string' ? value : '';
const pick = (row, fields) => Object.fromEntries(fields.map(key => [key, row[key] ?? null]));
export function pageNumber(value) {
  if (value === undefined) return 1;
  if (!/^[1-9]\d{0,4}$/.test(String(value))) fail(400, 'INVALID_PAGE', 'Invalid page number.');
  return Number(value);
}
export function assertOwner(row, field, employeeId) {
  if (!employeeId || row[field] !== employeeId) fail(403, 'ACCESS_DENIED', 'This record is not assigned to you.');
}
export function documentFiles(row) {
  return [...new Set([row.file, ...(Array.isArray(row.files) ? row.files : [row.files])]
    .filter(v => typeof v === 'string' && v && !/[\/\\\x00-\x1f]/.test(v)))];
}
const specs = {
  expenses: { collection: 'expenses', owner: 'employee_id', sort: '-date,-id',
    fields: ['id', 'date', 'amount', 'category', 'description', 'status'] },
  attendance: { collection: 'attendance', owner: 'staff_member', sort: '-date,-id',
    fields: ['id', 'date', 'status', 'check_in_time', 'check_out_time', 'hours_worked'] },
  'my-documents': { collection: 'employee_documents', owner: 'employee_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
  'truck-documents': { collection: 'truck_documents', owner: 'truck_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
};
export function createMobileDriverData(pb) {
  async function employee(id) {
    if (!id) fail(401, 'UNAUTHORIZED', 'Sign in again.');
    const row = await pb.collection('employees').getOne(id, { $autoCancel: false });
    if (row.id !== id) fail(403, 'ACCESS_DENIED', 'Employee identity mismatch.');
    return row;
  }
  async function ownerFor(section, employeeId) {
    if (section !== 'truck-documents') return employeeId;
    return text((await employee(employeeId)).assigned_truck);
  }
  async function tripSpec() {
    // Legacy records use driver_name. An employee relation must be installed and
    // explicitly populated by dispatch before we can expose or modify a trip.
    const [schema, employees] = await Promise.all([
      pb.collections.getOne('trip_logs', { $autoCancel: false }),
      pb.collections.getOne('employees', { $autoCancel: false }),
    ]);
    const field = (schema.fields || schema.schema || []).find(f =>
      ['driver_employee_id', 'driver_id'].includes(f.name) && f.type === 'relation' &&
      (f.collectionId || f.options?.collectionId) === employees.id &&
      (f.maxSelect ?? f.options?.maxSelect ?? 1) === 1);
    if (!field) fail(409, 'ASSIGNMENT_MAPPING_REQUIRED',
      'Dispatch must link trips to permanent employee IDs before mobile access is enabled.');
    return { collection: 'trip_logs', owner: field.name, sort: '-date,-id',
      fields: ['id', 'trip_id', 'date', 'route', 'origin', 'destination', 'truck_number', 'trip_status', 'kms'] };
  }
  async function list(section, employeeId, page = 1) {
    page = pageNumber(page);
    const spec = section === 'trips' ? await tripSpec() : specs[section];
    if (!spec) fail(404, 'NOT_FOUND', 'Unknown section.');
    const owner = await ownerFor(section, employeeId);
    if (!owner) return { items: [], page, totalPages: 0, totalItems: 0, reason: 'NO_TRUCK_ASSIGNED' };
    const result = await pb.collection(spec.collection).getList(page, 50, {
      filter: pb.filter(`${spec.owner} = {:owner}`, { owner }),
      sort: spec.sort, $autoCancel: false,
    });
    const items = result.items.map(row => {
      assertOwner(row, spec.owner, owner);
      const item = pick(row, spec.fields);
      if (section.endsWith('documents')) item.files = documentFiles(row).map((_, index) => ({
        index, path: `data/${section}/${encodeURIComponent(row.id)}/files/${index}`,
      }));
      return item;
    });
    return { items, page: result.page, totalPages: result.totalPages, totalItems: result.totalItems };
  }
  async function truck(employeeId) {
    const id = text((await employee(employeeId)).assigned_truck);
    if (!id) return null;
    const row = await pb.collection('trucks').getOne(id, { $autoCancel: false });
    if (row.id !== id) fail(403, 'ACCESS_DENIED', 'Truck identity mismatch.');
    return pick(row, ['id', 'truck_number', 'truck_name', 'model', 'truck_size', 'truck_axle', 'payload_capacity', 'status']);
  }
  async function file(section, recordId, index, employeeId) {
    if (!['my-documents', 'truck-documents'].includes(section) || !/^[a-zA-Z0-9_-]{1,64}$/.test(recordId))
      fail(404, 'NOT_FOUND', 'Document not found.');
    if (!/^\d{1,3}$/.test(String(index))) fail(404, 'NOT_FOUND', 'File not found.');
    const spec = specs[section];
    const owner = await ownerFor(section, employeeId);
    if (!owner) fail(403, 'ACCESS_DENIED', 'No truck assigned.');
    const row = await pb.collection(spec.collection).getOne(recordId, { $autoCancel: false });
    assertOwner(row, spec.owner, owner);
    const name = documentFiles(row)[Number(index)];
    if (!name) fail(404, 'NOT_FOUND', 'File not found.');
    return { row, name };
  }
  return { list, truck, file };
}
