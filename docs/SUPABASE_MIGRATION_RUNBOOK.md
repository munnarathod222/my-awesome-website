# Jai Bhavani Cargo - PocketBase to Supabase Migration Runbook

## Overview
This runbook provides step-by-step instructions for migrating business data, authentication, transaction ledgers, and document vaults from PocketBase (hosted on Render) to Supabase PostgreSQL, ensuring **zero downtime**, **zero data loss**, and **complete financial audit parity**.

---

## 1. Safety Principles & Guardrails
1. **Never expose the Supabase `service_role` key** in frontend React code or the Android Driver App. All client access must use the `anon` public key or authenticated JWTs with Row Level Security (RLS).
2. **Preserve primary keys**: PocketBase record IDs (15-character alphanumeric strings) are kept as PostgreSQL `TEXT PRIMARY KEY` to ensure historical URLs, file links, and ledger references do not break.
3. **Preserve permanent employee codes**: The six employee records (`E001`, `D001`, `D002`, `D003`, `D004`, `D005`) are permanently maintained.
4. **Offline validation first**: Run the dry-run migration script and reconciliation auditor before scheduling any production write freeze.
5. **No hardcoded credentials**: All database and API credentials must be passed via secure environment variables.

---

## 2. Pre-Migration Verification Checklist
Run the dry-run scanner:
```bash
node scripts/migrate_pocketbase_to_supabase.cjs --dry-run
```

Ensure the baseline totals match the verified database snapshot:
- **Employees**: 6 records (E001: Vinod Kumar Rathod, D001: Dayanand surwase, D002: Balbheem, D003: Suresh Edlai, D004: Sangameshwar Patane, D005: Chandrakant Shivaji Gaikwad)
- **Trucks**: 4 fleet trucks
- **Clients**: 3 active enterprise clients
- **Routes**: 2 active logistics routes
- **Trips**: 323 trip records (306 Delivered, 17 Upcoming)
- **Expenses**: 372 operational expense records
- **Advances**: 102 employee advance records
- **Attendance**: 291 attendance records
- **Cashbook**: 377 ledger entries
- **Local JSON stores**: 22 registries in `data/`

---

## 3. Staging Schema Deployment
1. Log into your Supabase Dashboard: `https://supabase.com/dashboard/project/<YOUR_SUPABASE_PROJECT_ID>`
2. Open the **SQL Editor**.
3. Paste and execute the contents of `supabase/schema.sql`.
4. Verify that all 82 business tables, `jbc_driver_accounts`, RLS policies, and triggers are created:
   - `employees`, `trucks`, `clients`, `routes`, `trip_logs`
   - `expenses`, `advances`, `attendance`, `cashbook`
   - `truck_documents`, `employee_documents`, `jbc_driver_accounts`
   - Triggers: `trg_sync_trip_payment_to_cashbook`, `trg_sync_advance_to_cashbook`

---

## 4. Production Cutover & Write-Freeze Procedure

### Step 4.1: Announce Scheduled Maintenance Window
- Notify dispatch team and fleet drivers 24 hours prior.
- Recommended window: Low-traffic dispatch hours (e.g., 23:00 - 01:00 IST).

### Step 4.2: Enable Write-Freeze (Read-Only Mode)
- Set environment variable on Render: `MAINTENANCE_MODE=true`
- Web app will display: *"System maintenance in progress. Dispatch updates will resume shortly."*

### Step 4.3: Execute Live Data Extraction & Import
Set the required environment variables:
```bash
export SUPABASE_URL="https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<your-supabase-service-role-key>"
node scripts/migrate_pocketbase_to_supabase.cjs --execute
```

### Step 4.4: Migrate Storage Files
1. Create private Supabase Storage buckets:
   - `truck-documents` (private)
   - `employee-documents` (private)
   - `trip-pods` (private)
   - `expense-receipts` (private)
2. Run migration tool which uploads files and verifies SHA-256 hashes against local source files.

### Step 4.5: Run Financial & Record Reconciliation
Execute the automated auditor:
```bash
node scripts/reconcile_supabase_migration.cjs
```
**Acceptance Criteria for Sign-off**:
- Row counts match exactly between PocketBase and Supabase for all tables.
- Total Trip Revenue: parity with source snapshot.
- Total Operational Expenses: parity with source snapshot.
- Total Advances Issued: parity with source snapshot.
- All permanent driver/employee codes match.
- Discrepancy tolerance: 0.

---

## 5. Backend Switchover on Render
1. Update Render Environment Variables:
   - `DATA_STORE=supabase`
   - `DRIVER_AUTH_STORE=supabase`
   - `SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>` (backend only)
   - `VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<anon-public-key>` (client safe)
   - `MAINTENANCE_MODE=false`
2. Restart Render Web Service.
3. Test dispatch trip creation and driver app login (`D001`, `D005`).

---

## 6. Rollback Plan
If any discrepancy is detected during reconciliation or testing:
1. Revert Render environment variable: `DATA_STORE=pocketbase`, `DRIVER_AUTH_STORE=local`.
2. Disable maintenance mode: `MAINTENANCE_MODE=false`.
3. Restart Render service.
4. The live website immediately resumes running off the untouched PocketBase database. No PocketBase data is deleted during migration.
