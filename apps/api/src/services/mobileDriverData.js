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
  expenses: { collection: 'expenses', owner: 'submitted_by_employee_id', sort: '-date,-id',
    fields: ['id', 'date', 'amount', 'category', 'description', 'status'] },
  attendance: { collection: 'attendance', owner: 'staff_member', sort: '-date,-id',
    fields: ['id', 'date', 'status', 'check_in_time', 'check_out_time', 'hours_worked'] },
  'my-documents': { collection: 'employee_documents', owner: 'employee_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
  'truck-documents': { collection: 'truck_documents', owner: 'truck_id', sort: '-created,-id',
    fields: ['id', 'document_type', 'document_name', 'document_number', 'issue_date', 'expiry_date', 'status'] },
};
export function createMobileDriverData(pb) {
  async function fieldsFor(name) {
    const schema = await pb.collections.getOne(name, { $autoCancel: false });
    return schema.fields || schema.schema || [];
  }
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
  async function tripSpec(employeeId, employeeCode) {
    // Dispatch must explicitly store a permanent employee relation or code.
    // Names are display-only and never authorize driver access.
    const [schema, employees] = await Promise.all([
      pb.collections.getOne('trip_logs', { $autoCancel: false }),
      pb.collections.getOne('employees', { $autoCancel: false }),
    ]);
    const field = (schema.fields || schema.schema || []).find(f =>
      ['driver_employee_id', 'driver_id'].includes(f.name) && f.type === 'relation' &&
      (f.collectionId || f.options?.collectionId) === employees.id &&
      (f.maxSelect ?? f.options?.maxSelect ?? 1) === 1);
    const codeField = (schema.fields || schema.schema || []).find(f =>
      ['driver_employee_code', 'driver_code'].includes(f.name) && f.type === 'text');
    if (!field && (!codeField || !/^[DE][0-9]{3,}$/.test(employeeCode || '')))
      fail(409, 'ASSIGNMENT_MAPPING_REQUIRED', 'The website must assign trips using permanent employee codes.');
    const owner = field?.name || codeField.name;
    const ownerValue = field ? employeeId : employeeCode;
    return { collection: 'trip_logs', owner, ownerValue, sort: '-date,-id',
      fields: ['id', 'trip_id', 'date', 'route', 'origin', 'destination', 'truck_number', 'trip_status', 'kms'] };
  }
  async function expenseSpec() {
    const fields = await fieldsFor('expenses');
    // Assignment/beneficiary is not proof of who submitted an expense.
    const submitted = fields.find(f => f.name === 'submitted_by_employee_id');
    if (!submitted) return null;
    if (submitted.type === 'relation') {
      const employees = await pb.collections.getOne('employees', { $autoCancel: false });
      if ((submitted.collectionId || submitted.options?.collectionId) !== employees.id ||
          (submitted.maxSelect ?? submitted.options?.maxSelect ?? 1) !== 1) return null;
    } else if (submitted.type !== 'text') return null;
    return { ...specs.expenses, owner: submitted.name,
      sort: fields.some(f => f.name === 'date') ? '-date,-id' : '-created,-id' };
  }
  async function list(section, employeeId, page = 1, employeeCode = null) {
    page = pageNumber(page);
    const spec = section === 'trips' ? await tripSpec(employeeId, employeeCode) :
      section === 'expenses' ? await expenseSpec() : specs[section];
    if (section === 'expenses' && !spec) return { items: [], page, totalPages: 0, totalItems: 0, reason: 'SUBMITTER_LINK_NOT_CONFIGURED' };
    if (!spec) fail(404, 'NOT_FOUND', 'Unknown section.');
    const owner = spec.ownerValue ?? await ownerFor(section, employeeId);
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
    return pick(row, ['id', 'truck_number', 'truck_name', 'model', 'truck_size', 'truck_axle', 'payload_capacity', 'status', 'manufacturer', 'vehicle_class', 'tyre_count', 'chassis_number', 'engine_number',
      'body_length', 'body_width', 'body_height', 'base_odometer', 'expected_mileage', 'fastag_provider', 'fastag_status',
      'current_fastag_balance', 'last_recharge_date', 'updated']);
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
  async function performance(employeeId, employeeCode) {
    const spec = await tripSpec(employeeId, employeeCode);
    const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const records = [];
    for (let page = 1; page <= 100; page++) {
      const result = await pb.collection('trip_logs').getList(page, 50, {
        filter: pb.filter(`${spec.owner} = {:owner} && date >= {:since}`, { owner: spec.ownerValue, since }),
        sort: '-date,-id', fields: `${spec.owner},id,kms,trip_status,delivery_eta,delivery_actual_time,delivered_time`, $autoCancel: false,
      });
      for (const row of result.items) { assertOwner(row, spec.owner, spec.ownerValue); records.push(row); }
      if (page >= result.totalPages) break;
      if (page === 100) fail(413, 'PERFORMANCE_LIMIT', 'Too many trips for this summary. Contact the office.');
    }
    return summarizePerformance(records, since);
  }
  return { list, truck, file, performance };
}

export function summarizePerformance(records, since) {
  const completed = records.filter(r => ['DELIVERED', 'COMPLETED'].includes(text(r.trip_status).trim().toUpperCase()));
  const km = completed.reduce((sum, row) => { const value = Number(row.kms); return sum + (Number.isFinite(value) && value >= 0 ? value : 0); }, 0);
  let measured = 0; let onTime = 0;
  for (const row of completed) {
    const eta = Date.parse(row.delivery_eta); const actual = Date.parse(row.delivery_actual_time || row.delivered_time);
    if (!Number.isFinite(eta) || !Number.isFinite(actual)) continue;
    measured++; if (actual <= eta) onTime++;
  }
  return { since, periodDays: 90, totalTrips: records.length, completedTrips: completed.length,
    completedKm: Math.round(km * 10) / 10, onTimeMeasuredTrips: measured,
    onTimePercent: measured ? Math.round(100 * onTime / measured) : null };
}
