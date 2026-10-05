# Driver website connection — first deployment

This bundle adds authenticated **read-only** mobile access to the website. It is not the complete operational driver rollout. No migration, automatic backfill, accounting write, password change or production test submission is included.

## Ready in this bundle

- Own expense history, attendance history, driver document metadata and authenticated PDF/image downloads.
- Currently assigned truck details and documents, checked against the employee's current assignment on every request.
- Trip list access only when the collection has a single employee relation named `driver_employee_id` or `driver_id`, pointing to the `employees` collection. Name-only assignments deliberately return `ASSIGNMENT_MAPPING_REQUIRED`.
- Explicit server errors, pagination, no-store responses, bounded downloads, allowlisted fields, ownership checks, and first-login password-change gating.

Only records with the actual employee ID in `employee_id` (expenses/documents) or `staff_member` (attendance) are returned. Old records containing only a name are not automatically claimed by a driver.

## Deploy

Reviewed authentication router: GitHub main `551f483897db2bf8986fdb371f55d77d95638719`; unchanged at `4dfcfc2fa0b938e7313169a1c6332b0c75bd439f` when the release checkout was prepared.

1. Use the website checkout matching GitHub main, not the older Antigravity checkout with unpublished edits.
2. Run `node install.mjs PATH_TO_WEBSITE` to validate the existing auth router. It checks a checksum and refuses unexpected source changes.
3. Run the same command with `--apply` to add the two modules and register them in `mobileAuth.js`.
4. Review and commit only these three server files. Do not upload local databases, backups, generated web assets, environment files or other unpublished work.
5. Deploy that reviewed commit through Render. No new environment values or dependencies are needed for this read-only stage.
6. Install the matching v1.6 records-preview APK over v1.5. Sign in with the already established driver password, then open the drawer sections.

The bundle tests run with `node --test tests/*.test.mjs`. They use synthetic records and injected adapters, not the website or a production database. A matching test pair is included under `apps/api/tests` in the release branch.

Routes, under `/api/mobile/v1`, all require the driver's Bearer access token:

| GET route | Purpose |
|---|---|
| `/data/capabilities` | Explicit read-only capabilities; writes and FCM are false |
| `/data/trips?page=1` | Trips explicitly linked to the authenticated employee |
| `/data/expenses?page=1` | Own expense history |
| `/data/attendance?page=1` | Own attendance history |
| `/data/truck` | Assigned truck |
| `/data/my-documents?page=1` | Driver document metadata |
| `/data/truck-documents?page=1` | Assigned truck document metadata |
| `/data/:section/:id/files/:index` | Ownership-checked PDF/image proxy, 20 MB limit |

The client never receives PocketBase administrator credentials or a reusable administrator file token. A failed database request is an error, not an empty success.

## Required before daily operational use

1. **Permanent trip assignment.** Add a nullable employee relation through a reviewed schema change and update office trip creation/editing to save the selected employee ID. Existing name-only trips require explicit office reconciliation; never silently infer ownership by name. No such schema change is executed by this bundle.
2. **Trip workflow and offline reconciliation.** Add durable event IDs, current assignment revision, conditional state transitions, GPS/device metadata, cancellation/reassignment invalidation, and acknowledgement before treating actions as saved. The website's four statuses cannot represent the Android nine-state workflow without an additional mobile state/event model.
3. **Expense approval and bills.** Add a distinct pending-submission workflow with attachment storage, idempotency, assigned supervisor access and audited approval/rejection. The existing office form defaults to Approved and has cashbook side effects; it must not be reused as a driver submission shortcut.
4. **POD, issue and attendance submission.** Define protected upload/request APIs with ownership checks, durable retry and explicit approval rules. Attendance viewing works in this stage; clock-in/out does not.
5. **Performance.** Calculate metrics from linked trips and real timestamps. No fabricated ratings or punctuality percentages are displayed.
6. **Firebase.** The owner confirmed no project exists yet. Register Android package `com.jaibhavani.driver`, configure FCM client registration and a server sender, then wire committed dispatch events to notifications. Notifications must prompt an authenticated assignment refresh; they cannot authorize a trip by themselves.
7. **Persistence and acceptance.** Verify driver auth/session storage and new operational tables survive a Render restart/deploy; test through a designated driver with synthetic fixtures locally before a controlled pilot. The existing JSON auth store's live durability is not established by this change.

## Rollback

Remove the two new imports and `mountMobileDriverData(...)` call from `mobileAuth.js` and redeploy. The new modules can remain unused or be removed. Existing records need no rollback because this stage has no business writes. The old v1.5 APK remains available.
