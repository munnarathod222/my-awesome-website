import test from 'node:test';
import assert from 'node:assert/strict';
import { createMobileDriverData, summarizePerformance } from '../src/services/mobileDriverData.js';
import {
  isValidEmployeeCode,
  resolveDriverAssignment,
  getEmployeeIdByCode
} from '../src/services/employeeCodeService.js';

// Synthetic Employee & Trip In-Memory Test Fixture
function createSyntheticEnvironment() {
  const employees = [
    { id: 'emp_004', employee_code: 'D004', name: 'Ramesh Kumar', status: 'Active', assigned_truck: 'truck_1' },
    { id: 'emp_005', employee_code: 'D005', name: 'Ramesh Kumar', status: 'Active', assigned_truck: 'truck_2' }, // Same display name!
    { id: 'emp_006', employee_code: 'D006', name: 'Suresh Patil', status: 'Active', assigned_truck: 'truck_3' }
  ];

  const trips = [
    // Trip assigned to D004
    {
      id: 'trip_101',
      trip_id: 'TRP-101',
      date: '2026-10-01',
      driver_employee_id: 'emp_004',
      driver_employee_code: 'D004',
      driver_name: 'Ramesh Kumar',
      trip_status: 'Delivered',
      kms: 350,
      revenue: 45000,
      fuel_amount: 12000,
      driver_advance: 5000
    },
    // Trip assigned to D005 (same name 'Ramesh Kumar', distinct code 'D005')
    {
      id: 'trip_102',
      trip_id: 'TRP-102',
      date: '2026-10-02',
      driver_employee_id: 'emp_005',
      driver_employee_code: 'D005',
      driver_name: 'Ramesh Kumar',
      trip_status: 'In Transit',
      kms: 500,
      revenue: 60000,
      fuel_amount: 18000,
      driver_advance: 6000
    },
    // Cancelled trip assigned to D004
    {
      id: 'trip_103',
      trip_id: 'TRP-103',
      date: '2026-10-03',
      driver_employee_id: 'emp_004',
      driver_employee_code: 'D004',
      driver_name: 'Ramesh Kumar',
      trip_status: 'Cancelled',
      kms: 0,
      revenue: 0,
      fuel_amount: 0,
      driver_advance: 0
    },
    // Legacy name-only trip (no permanent code)
    {
      id: 'trip_legacy_1',
      trip_id: 'TRP-LEGACY-001',
      date: '2026-09-15',
      driver_employee_id: null,
      driver_employee_code: null,
      driver_name: 'Ramesh Kumar',
      trip_status: 'Delivered',
      kms: 420,
      revenue: 55000,
      fuel_amount: 15000,
      driver_advance: 5000
    }
  ];

  const expenses = [
    {
      id: 'exp_1',
      submitted_by_employee_id: 'emp_004',
      beneficiary_employee_id: 'emp_005',
      truck_number: 'truck_2',
      amount: 1500,
      category: 'Food',
      status: 'Pending'
    },
    {
      id: 'exp_2',
      submitted_by_employee_id: 'emp_005',
      beneficiary_employee_id: 'emp_004',
      truck_number: 'truck_1',
      amount: 2200,
      category: 'Toll',
      status: 'Pending'
    }
  ];

  const pb = {
    filter: (filterStr, args) => {
      return { filterStr, args };
    },
    collections: {
      getOne: async name => {
        if (name === 'employees') return { id: 'col_employees' };
        if (name === 'trip_logs') {
          return {
            fields: [
              { name: 'driver_employee_id', type: 'relation', collectionId: 'col_employees', maxSelect: 1 },
              { name: 'driver_employee_code', type: 'text' },
              { name: 'driver_name', type: 'text' }
            ]
          };
        }
        if (name === 'expenses') {
          return {
            fields: [
              { name: 'submitted_by_employee_id', type: 'text' }
            ]
          };
        }
        return { fields: [] };
      }
    },
    collection: name => ({
      getOne: async id => {
        if (name === 'employees') return employees.find(e => e.id === id) || null;
        if (name === 'trip_logs') return trips.find(t => t.id === id) || null;
        return null;
      },
      getFullList: async ({ filter } = {}) => {
        if (name === 'employees') return employees;
        if (name === 'trip_logs') {
          return trips.filter(t => !t.driver_employee_code);
        }
        return [];
      },
      getList: async (page = 1, perPage = 20, options = {}) => {
        if (name === 'trip_logs') {
          let items = trips;
          if (options.filter) {
            const owner = options.filter.args?.owner;
            items = items.filter(t => t.driver_employee_id === owner || t.driver_employee_code === owner);
          }
          return { page, perPage, totalPages: 1, totalItems: items.length, items };
        }
        if (name === 'expenses') {
          let items = expenses;
          if (options.filter) {
            const owner = options.filter.args?.owner;
            items = items.filter(e => e.submitted_by_employee_id === owner);
          }
          return { page, perPage, totalPages: 1, totalItems: items.length, items };
        }
        return { page: 1, perPage: 20, totalPages: 0, totalItems: 0, items: [] };
      },
      update: async (id, patch) => {
        const trip = trips.find(t => t.id === id);
        if (trip) Object.assign(trip, patch);
        return trip;
      }
    })
  };

  const mobileApi = createMobileDriverData(pb);

  return { employees, trips, expenses, pb, mobileApi };
}

// ----------------------------------------------------------------------------------
// TEST SUITE: Trip Assignment by Permanent Driver Code
// ----------------------------------------------------------------------------------

test('1. Two drivers with identical name but different codes (D004 vs D005) have strict trip isolation', async () => {
  const { mobileApi } = createSyntheticEnvironment();

  // D004 request: Ramesh Kumar with code D004
  const resD004 = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  assert.equal(resD004.items.length, 2); // trip_101 and trip_103 (cancelled)
  assert.ok(resD004.items.some(t => t.id === 'trip_101'));
  assert.ok(resD004.items.some(t => t.id === 'trip_103'));
  assert.ok(!resD004.items.some(t => t.id === 'trip_102')); // Does not see D005 trip!

  // D005 request: Ramesh Kumar with code D005
  const resD005 = await mobileApi.list('trips', 'emp_005', 1, 'D005');
  assert.equal(resD005.items.length, 1); // trip_102 only
  assert.equal(resD005.items[0].id, 'trip_102');
  assert.ok(!resD005.items.some(t => t.id === 'trip_101')); // Does not see D004 trip!
});

test('2. Renamed driver keeping the same permanent code retains full historical & new trip access', async () => {
  const env = createSyntheticEnvironment();
  const { mobileApi, employees, trips } = env;

  // D004 is renamed from "Ramesh Kumar" to "Ramesh K. Rathod"
  const d004Emp = employees.find(e => e.employee_code === 'D004');
  d004Emp.name = 'Ramesh K. Rathod';

  // Driver queries trips with permanent code D004
  const res = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  assert.equal(res.items.length, 2);
  assert.equal(res.items[0].id, 'trip_101');

  // Verify code resolution still maps to emp_004
  const resolved = resolveDriverAssignment({ driverCode: 'D004' }, employees);
  assert.equal(resolved.driver_employee_id, 'emp_004');
  assert.equal(resolved.driver_employee_code, 'D004');
});

test('3. Caller-supplied identity cannot bypass verified driver session (D004 cannot read D005)', async () => {
  const { mobileApi } = createSyntheticEnvironment();

  // If upstream returns a trip belonging to D005 when caller authenticated as D004, assertOwner rejects it
  const corruptedPb = {
    filter: (s, args) => ({ filterStr: s, args }),
    collections: {
      getOne: async () => ({
        fields: [
          { name: 'driver_employee_id', type: 'relation', collectionId: 'col_employees', maxSelect: 1 },
          { name: 'driver_employee_code', type: 'text' }
        ]
      })
    },
    collection: () => ({
      getList: async () => ({
        page: 1, perPage: 20, totalPages: 1, totalItems: 1,
        items: [{ id: 'trip_102', driver_employee_code: 'D005' }] // Returns D005 trip
      })
    })
  };

  const maliciousApi = createMobileDriverData(corruptedPb);
  await assert.rejects(maliciousApi.list('trips', 'emp_004', 1, 'D004'), { code: 'ACCESS_DENIED' });
});

test('4. Missing or invalid employee codes are rejected by employeeCodeService', () => {
  const { employees } = createSyntheticEnvironment();

  // Missing code
  assert.throws(() => resolveDriverAssignment({}, employees), /requires permanent employee code/);

  // Invalid formats
  assert.equal(isValidEmployeeCode(''), false);
  assert.equal(isValidEmployeeCode('INVALID'), false);
  assert.equal(isValidEmployeeCode('D4'), false);
  assert.equal(isValidEmployeeCode('D12'), false);
  assert.equal(isValidEmployeeCode('Ramesh'), false); // Display name rejected

  // Code format regex validation
  assert.equal(isValidEmployeeCode('D004'), true);
  assert.equal(isValidEmployeeCode('D005'), true);
  assert.equal(isValidEmployeeCode('E101'), true);

  // Code not found in directory
  assert.throws(() => resolveDriverAssignment({ driverCode: 'D999' }, employees), /Employee record could not be resolved/);

  // Display name passed as code is strictly rejected
  assert.throws(() => resolveDriverAssignment({ driverCode: 'Ramesh Kumar' }, employees), /Invalid employee code format/);
});

test('5. Inconsistent / conflicting employee code and employee ID pair is rejected', () => {
  const { employees } = createSyntheticEnvironment();

  // Passing D004 with employee ID of D005
  assert.throws(() => {
    resolveDriverAssignment({ driverCode: 'D004', driverEmployeeId: 'emp_005' }, employees);
  }, /Inconsistent driver assignment/);

  // Matching pair succeeds
  const valid = resolveDriverAssignment({ driverCode: 'D004', driverEmployeeId: 'emp_004' }, employees);
  assert.equal(valid.driver_employee_id, 'emp_004');
  assert.equal(valid.driver_employee_code, 'D004');
});

test('6. Reassignment immediately revokes previous driver and grants access to new driver', async () => {
  const env = createSyntheticEnvironment();
  const { mobileApi, trips, pb } = env;

  // Initial state: trip_101 belongs to D004
  const initialD004 = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  assert.ok(initialD004.items.some(t => t.id === 'trip_101'));

  // Office reassigns trip_101 from D004 to D006
  const oldCode = trips[0].driver_employee_code;
  await pb.collection('trip_logs').update('trip_101', {
    driver_employee_id: 'emp_006',
    driver_employee_code: 'D006',
    driver_name: 'Suresh Patil'
  });

  // Verify D004 no longer has access to trip_101
  const afterD004 = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  assert.ok(!afterD004.items.some(t => t.id === 'trip_101'));

  // Verify D006 now has access to trip_101
  const afterD006 = await mobileApi.list('trips', 'emp_006', 1, 'D006');
  assert.ok(afterD006.items.some(t => t.id === 'trip_101'));
  assert.equal(afterD006.items[0].id, 'trip_101');
});

test('7. Cancelled trips remain visible as cancelled to authorized driver', async () => {
  const { mobileApi } = createSyntheticEnvironment();

  const res = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  const cancelledTrip = res.items.find(t => t.id === 'trip_103');

  assert.ok(cancelledTrip, 'Cancelled trip should be visible to authorized driver');
  assert.equal(cancelledTrip.trip_status, 'Cancelled', 'Cancelled status is preserved and not hidden');
});

test('8. Legacy trips with no code are never returned to mobile driver app', async () => {
  const { mobileApi } = createSyntheticEnvironment();

  // Query D004: legacy trip_legacy_1 (which has driver_name 'Ramesh Kumar' but no code) is NOT returned
  const resD004 = await mobileApi.list('trips', 'emp_004', 1, 'D004');
  assert.ok(!resD004.items.some(t => t.id === 'trip_legacy_1'));

  // Query D005: legacy trip is also NOT returned
  const resD005 = await mobileApi.list('trips', 'emp_005', 1, 'D005');
  assert.ok(!resD005.items.some(t => t.id === 'trip_legacy_1'));
});

test('9. Office reconciliation lists unassigned trips without altering financials', async () => {
  const env = createSyntheticEnvironment();
  const { pb, trips } = env;

  const unassigned = await pb.collection('trip_logs').getFullList({
    filter: 'driver_employee_code = "" || driver_employee_code = null'
  });

  assert.equal(unassigned.length, 1);
  assert.equal(unassigned[0].id, 'trip_legacy_1');
  assert.equal(unassigned[0].revenue, 55000);
  assert.equal(unassigned[0].driver_advance, 5000);

  // Office assigns D004 explicitly
  await pb.collection('trip_logs').update('trip_legacy_1', {
    driver_employee_id: 'emp_004',
    driver_employee_code: 'D004',
    driver_name: 'Ramesh Kumar'
  });

  const reconciledTrip = trips.find(t => t.id === 'trip_legacy_1');
  assert.equal(reconciledTrip.driver_employee_code, 'D004');
  assert.equal(reconciledTrip.revenue, 55000, 'Revenue remains exactly unchanged');
  assert.equal(reconciledTrip.fuel_amount, 15000, 'Fuel remains exactly unchanged');
  assert.equal(reconciledTrip.driver_advance, 5000, 'Advance remains exactly unchanged');
});

test('10. Expense isolation: mobile driver app queries show ONLY expenses submitted by that driver', async () => {
  const { mobileApi } = createSyntheticEnvironment();

  // D004 has submitted exp_1 (even though truck is truck_2 and beneficiary is emp_005)
  const expD004 = await mobileApi.list('expenses', 'emp_004');
  assert.equal(expD004.items.length, 1);
  assert.equal(expD004.items[0].id, 'exp_1');

  // D005 has submitted exp_2 (even though truck is truck_1 and beneficiary is emp_004)
  const expD005 = await mobileApi.list('expenses', 'emp_005');
  assert.equal(expD005.items.length, 1);
  assert.equal(expD005.items[0].id, 'exp_2');
});
