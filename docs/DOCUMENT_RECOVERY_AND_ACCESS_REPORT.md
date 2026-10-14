# Jai Bhavani Cargo - Document Recovery & Relational Audit Report

## Executive Summary
This report documents the relational integrity and storage status of files across the Jai Bhavani Cargo fleet records as of 14 October 2026.

- **Total Truck Document Records**: 38
- **Total Employee Document Records**: 8
- **Authoritative Database Source**: `scratch/live_backup_before_migration.db`

---

## 1. Analysis of the 38 Truck Document Records

### Verified Authoritative Records
- **Vehicle Match (6 records)**:
  - Relational Link: `truck_id = "gw8rd1l65z797i4"`
  - Associated Truck: **TG12 U 2637** (Active Fleet Truck)
  - Documents: Registration Certificate (RC), Comprehensive Insurance, Pollution Under Control (PUC), All India Tourist/Goods Permit, Fitness Certificate, Road Tax Receipt.
  - Verification Status: **VERIFIED MATCH**. Accessible to drivers assigned to TG12 U 2637.

### Unmatched Records (32 records)
- **Observed Groupings**:
  - 25 records store `truck_id = "COMPANY_VAULT"` containing enterprise business documents (GSTIN certificate, MSME/Udyam certificate, Proprietor PAN, Transporter registrations).
  - 7 records store `truck_id = "FLEET_RC_BUNDLE"` containing aggregated fleet registration scans.
- **Verification vs. Assumption**:
  - *Verified Fact*: 32 records have `truck_id` values that do not match any row in the current `trucks` table (`trucks.id` or `truck_number`).
  - *Distinction*: While these strings indicate office vaults and multi-truck bundles, **they are not formal foreign keys**.
  - *Unfinished Action Required*: These 32 relationships are flagged for explicit office review. They must NOT be automatically deleted, inferred, or linked to specific trucks without administrative confirmation.
  - *Access Restriction*: These records are strictly excluded from the mobile driver endpoints (`/api/mobile/v1/data/truck-documents`) to prevent unauthorized disclosure of company credentials.

---

## 2. Audit of the Eleven File References

In the 14 October 2026 Supabase backup archive comparison, eleven file references were absent from the captured backup storage list:

| Collection | Record ID | Referenced Filename | Backup Snapshot Status | Authoritative Ledger Status | Recovery Action / Verification Plan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `truck_documents` | `z44mhg4nc3e9kwm` | `img_1909_7e4rqy1gf2.jpg` | Missing from Backup | Record Preserved | Check live Render disk `/var/data/pb_data/storage` |
| `truck_documents` | `b4dyknnr6exyvlx` | `img_1908_hjq6ytug28.jpg` | Missing from Backup | Record Preserved | Check live Render disk `/var/data/pb_data/storage` |
| `truck_documents` | `88u9ic9jp0cfwup` | `img_20260903_192219_5s9k9enmhi.jpg` | Missing from Backup | Record Preserved | Check live Render disk `/var/data/pb_data/storage` |
| `truck_documents` | `z44mhg4nc3e9kwm` | `rc_scan_v2.jpg` | Missing from Backup | Record Preserved | Check office physical archive if absent on Render |
| `truck_documents` | `b4dyknnr6exyvlx` | `permit_page2.jpg` | Missing from Backup | Record Preserved | Check office physical archive if absent on Render |
| `truck_documents` | `88u9ic9jp0cfwup` | `fitness_slip.jpg` | Missing from Backup | Record Preserved | Check office physical archive if absent on Render |
| `service_logs` | `srv_tg12_01` | `service_invoice_oct25.pdf` | Missing from Backup | Financial Ledger Intact | Re-scan invoice from paper filing |
| `service_logs` | `srv_tg12_02` | `oil_change_receipt.pdf` | Missing from Backup | Financial Ledger Intact | Re-scan invoice from paper filing |
| `service_logs` | `srv_tg12_03` | `tyre_replacement_inv.pdf` | Missing from Backup | Financial Ledger Intact | Re-scan invoice from paper filing |
| `service_logs` | `srv_tg12_04` | `brake_pad_bill.pdf` | Missing from Backup | Financial Ledger Intact | Re-scan invoice from paper filing |
| `loan_profiles` | `loan_tg12_hffc` | `hffc_loan_agreement.pdf` | Missing from Backup | Financial Ledger Intact | Copy from bank agreement physical kit |

### Verification Status:
- **Ledger Preservation**: 100% verified. All financial values, invoice amounts, service timestamps, and loan schedules are present and undisturbed in the database.
- **Physical/Live Disk Verification**: Unfinished. Live filesystem verification on Render requires SSH/shell access during the scheduled maintenance window.

---

## 3. Strict Document Access & Security Controls

1. **Driver Ownership Verification**:
   The Android Driver App can only download documents matching their authenticated assignment:
   - Personal employee documents: `employee_id === req.driverAuth.employeeId`.
   - Truck documents: `truck_id === assigned_truck_id`.
   - Trip PODs: `validateDriverAssignment(trip, employeeId, employeeCode)`.
2. **Access Denial**:
   Any attempt to query unassigned documents, other trucks' files, or company vault documents returns `403 ACCESS_DENIED` or `404 NOT_FOUND`.
3. **Signed Private Storage**:
   Target Supabase Storage buckets are private. URLs are short-lived and served via server-side authorization checks.
