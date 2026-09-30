import { employeesData, trucksData, tyresData, routesData, clientsData, tripsData, cashbookData, fuelLogsData, billingCyclesData, creditCardsData, inventoryData, remindersData, expenseCategoriesData, expensesData, initialCompanySettings, lorryReceiptsData, podRecordsData, documentSequencesData, supportTicketsData } from './seedData';
import { Employee, Truck, TruckTyre, Route, ClientProfile, TripLog, CashbookTransaction, FuelLog, BillingCycle, CreditCard, InventoryItem, Reminder, DriverAccidentReport, MailboxMessage, FleetPart, MaintenanceProblem, Expense, ExpenseCategoryItem, LorryReceipt, PodRecord, DocumentSequence, DocumentAuditLog, SupportTicket, AuditAction, AuditModule } from '../types';
import { enterpriseAuditService } from '../services/enterpriseAuditService';

const TODAY_DATE = '2026-09-02';

function getItem(key: string, defaultValue: any) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    
    // Anti-Data-Loss Protection: Always preserve user-added items first
    if (Array.isArray(parsed) && Array.isArray(defaultValue) && defaultValue.length > 0) {
      const existingIds = new Set(parsed.map((i: any) => i.id).filter(Boolean));
      const missingDefaults = defaultValue.filter((d: any) => d.id && !existingIds.has(d.id));
      return [...parsed, ...missingDefaults];
    }
    return parsed;
  } catch (e) {
    return defaultValue;
  }
}

function auditDiff(key: string, oldValue: any, newValue: any) {
  try {
    const moduleMap: Record<string, { module: AuditModule; entity_type: string }> = {
      jc_trips: { module: 'LOGISTICS', entity_type: 'TRIP' },
      jc_trucks: { module: 'FLEET', entity_type: 'TRUCK' },
      jc_tyres: { module: 'FLEET', entity_type: 'TYRE' },
      jc_cashbook: { module: 'FINANCIAL', entity_type: 'CASHBOOK' },
      jc_expenses: { module: 'FINANCIAL', entity_type: 'EXPENSE' },
      jc_fuel_logs: { module: 'FLEET', entity_type: 'FUEL_LOG' },
      jc_employees: { module: 'ADMINISTRATION', entity_type: 'EMPLOYEE' },
      jc_users: { module: 'ADMINISTRATION', entity_type: 'USER' },
      jc_lorry_receipts: { module: 'LOGISTICS', entity_type: 'LORRY_RECEIPT' },
      jc_pod_records: { module: 'LOGISTICS', entity_type: 'POD_RECORD' },
      jc_support_tickets: { module: 'LOGISTICS', entity_type: 'SUPPORT_TICKET' },
      jc_company_settings: { module: 'SETTINGS', entity_type: 'COMPANY_SETTINGS' }
    };

    const target = moduleMap[key];
    if (!target) return;

    if (key === 'jc_company_settings') {
      enterpriseAuditService.logEvent({
        module: target.module,
        entity_type: target.entity_type,
        entity_id: 'GLOBAL_SETTINGS',
        action: 'CONFIGURATION_CHANGE',
        details: 'Company operational parameters updated',
        previous_values: oldValue,
        new_values: newValue
      });
      return;
    }

    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      const oldMap = new Map(oldValue.map(i => [i.id || i.trip_number || i.truck_number || i.ticket_number, i]));
      const newMap = new Map(newValue.map(i => [i.id || i.trip_number || i.truck_number || i.ticket_number, i]));

      // 1. Detect creations
      for (const [id, item] of newMap.entries()) {
        if (!oldMap.has(id)) {
          enterpriseAuditService.logEvent({
            module: target.module,
            entity_type: target.entity_type,
            entity_id: String(id),
            action: 'CREATE',
            details: `Created new ${target.entity_type} [${id}]`,
            new_values: item
          });
        }
      }

      // 2. Detect deletions
      for (const [id, item] of oldMap.entries()) {
        if (!newMap.has(id)) {
          enterpriseAuditService.logEvent({
            module: target.module,
            entity_type: target.entity_type,
            entity_id: String(id),
            action: 'DELETE',
            severity: 'HIGH',
            details: `Deleted ${target.entity_type} [${id}]`,
            previous_values: item
          });
        }
      }

      // 3. Detect updates
      for (const [id, newItem] of newMap.entries()) {
        if (oldMap.has(id)) {
          const oldItem = oldMap.get(id);
          const changedFields: string[] = [];
          const allKeys = new Set([...Object.keys(oldItem || {}), ...Object.keys(newItem || {})]);
          allKeys.forEach(k => {
            if (JSON.stringify(oldItem[k]) !== JSON.stringify(newItem[k])) {
              changedFields.push(k);
            }
          });

          if (changedFields.length > 0) {
            let action: AuditAction = 'UPDATE';
            if (changedFields.includes('clientPaymentStatus') || changedFields.includes('payment_status')) {
              action = 'PAYMENT';
            } else if (changedFields.includes('status')) {
              action = (newItem.status === 'Completed' || newItem.status === 'Delivered') ? 'APPROVE' : 'UPDATE';
            }

            enterpriseAuditService.logEvent({
              module: target.module,
              entity_type: target.entity_type,
              entity_id: String(id),
              action,
              details: `Updated ${changedFields.join(', ')} on ${target.entity_type} [${id}]`,
              previous_values: oldItem,
              new_values: newItem,
              changed_fields: changedFields
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('[Audit Diff Warning]', e);
  }
}

function setItem(key: string, value: any) {
  try {
    const rawOld = localStorage.getItem(key);
    const oldValue = rawOld ? JSON.parse(rawOld) : null;
    
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('jc-store-update'));

    if (oldValue !== null) {
      auditDiff(key, oldValue, value);
    }
  } catch (e) {
    console.error(e);
  }
}

export const dbtabeses = {
  getItem,
  setItem,
  getCompanySettings: () => {
    const saved = getItem('jc_company_settings', {});
    return { ...initialCompanySettings, ...saved };
  },
  setCompanySettings: (settings: any) => setItem('jc_company_settings', settings),
  getEmployees: () => getItem('jc_employees', employeesData),
  setEmployees: (data: any) => setItem('jc_employees', data),
  getTrucks: () => getItem('jc_trucks', trucksData),
  setTrucks: (data: any) => setItem('jc_trucks', data),
  getTyres: () => getItem('jc_tyres', tyresData),
  setTyres: (data: any) => setItem('jc_tyres', data),
  getTyreSwapLogs: () => getItem('jc_tyre_swap_logs', []),
  setTyreSwapLogs: (data: any) => setItem('jc_tyre_swap_logs', data),
  getRoutes: () => getItem('jc_routes', routesData),
  setRoutes: (data: any) => setItem('jc_routes', data),
  getClients: () => getItem('jc_clients', clientsData),
  setClients: (data: any) => setItem('jc_clients', data),
  getTrips: (): TripLog[] => {
    const rawTrips: TripLog[] = getItem('jc_trips', tripsData);
    const nowTime = new Date(TODAY_DATE).getTime();

    let needsSave = false;
    const sanitized = rawTrips.map(t => {
      let isFuture = false;

      if (t.start_date) {
        // Parse date strings like '30 Sep 2026' or '2026-09-30'
        const tripTime = new Date(t.start_date).getTime();
        if (!isNaN(tripTime) && tripTime > nowTime + 86400000) {
          isFuture = true;
        }
      }

      if (t.trip_number && (t.trip_number.startsWith('TRIP-28') || t.trip_number.startsWith('TRIP-29') || t.trip_number.startsWith('TRIP-3'))) {
        isFuture = true;
      }

      const clientName = !t.client_name || t.client_name === 'Unknown Client' ? 'Amazon Logistics India' : t.client_name;
      
      // Preserve status if trip is Paid or explicitly marked Completed/Delivered
      let targetStatus = t.status || 'Delivered';
      if (t.clientPaymentStatus === 'Paid' && (t.status === 'Scheduled' || t.status === 'In Transit' || !t.status)) {
        targetStatus = 'Completed';
        needsSave = true;
      } else if (isFuture && t.clientPaymentStatus !== 'Paid' && t.status !== 'Completed' && t.status !== 'Delivered') {
        targetStatus = t.status === 'In Transit' ? 'In Transit' : 'Scheduled';
      }

      if (t.client_name !== clientName || (isFuture && t.clientPaymentStatus !== 'Paid' && t.status === 'Delivered')) {
        needsSave = true;
      }

      return {
        ...t,
        client_name: clientName,
        status: targetStatus
      };
    });

    // Auto-update localStorage cache if sanitization made fixes
    if (needsSave) {
      try {
        localStorage.setItem('jc_trips', JSON.stringify(sanitized));
      } catch (e) {}
    }

    return sanitized;
  },
  setTrips: (data: any) => setItem('jc_trips', data),
  getCashbook: () => getItem('jc_cashbook', cashbookData),
  setCashbook: (data: any) => setItem('jc_cashbook', data),
  getFuelLogs: () => getItem('jc_fuel_logs', fuelLogsData),
  setFuelLogs: (data) => setItem('jc_fuel_logs', data),
  getBillingCycles: () => getItem('jc_billing_cycles', billingCyclesData),
  setBillingCycles: (data) => setItem('jc_billing_cycles', data),
  getCreditCards: () => getItem('jc_credit_cards', creditCardsData),
  setCreditCards: (data) => setItem('jc_credit_cards', data),
  getInventory: () => getItem('jc_inventory', inventoryData),
  setInventory: (data) => setItem('jc_inventory', data),
  getFleetParts: () => getItem('jc_fleet_parts', []),
  setFleetParts: (data) => setItem('jc_fleet_parts', data),
  getMaintenanceProblems: () => getItem('jc_maintenance_problems', []),
  setMaintenanceProblems: (data) => setItem('jc_maintenance_problems', data),
  getReminders: () => getItem('jc_reminders', remindersData),
  setReminders: (data) => setItem('jc_reminders', data),
  getAccidents: () => getItem('jc_accidents', []),
  setAccidents: (data) => setItem('jc_accidents', data),
  getUsers: () => getItem('jc_users', []),
  setUsers: (data) => setItem('jc_users', data),
  getMailboxMessages: () => getItem('jc_mailbox', []),
  setMailboxMessages: (data) => setItem('jc_mailbox', data),
  getExpenseCategories: (): ExpenseCategoryItem[] => getItem('jc_expense_categories', expenseCategoriesData),
  setExpenseCategories: (data: any) => setItem('jc_expense_categories', data),
  getExpenses: (): Expense[] => getItem('jc_expenses', expensesData),
  setExpenses: (data: any) => setItem('jc_expenses', data),
  getLorryReceipts: (): LorryReceipt[] => getItem('jc_lorry_receipts', lorryReceiptsData),
  setLorryReceipts: (data: LorryReceipt[]) => setItem('jc_lorry_receipts', data),
  getPodRecords: (): PodRecord[] => getItem('jc_pod_records', podRecordsData),
  setPodRecords: (data: PodRecord[]) => setItem('jc_pod_records', data),
  getDocumentSequences: (): DocumentSequence[] => getItem('jc_document_sequences', documentSequencesData),
  setDocumentSequences: (data: DocumentSequence[]) => setItem('jc_document_sequences', data),
  getAuditLogs: (): DocumentAuditLog[] => getItem('jc_document_audit_logs', []),
  setAuditLogs: (data: DocumentAuditLog[]) => setItem('jc_document_audit_logs', data),
  getSupportTickets: (): SupportTicket[] => getItem('jc_support_tickets', supportTicketsData),
  setSupportTickets: (data: SupportTicket[]) => setItem('jc_support_tickets', data)
};
