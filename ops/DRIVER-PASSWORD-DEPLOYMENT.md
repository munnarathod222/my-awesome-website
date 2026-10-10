# Driver password persistence fix

## Diagnosis and scope

The old server writes account password hashes into data/driver_app_accounts.json, which is tracked in the repository. Render can replace that local file with the deployed snapshot. Database backups do not cover that JSON file. Save failures were swallowed. These are confirmed code defects; the exact sequence of the reported live failures has not been observed in server logs.

The fix adds a separate Supabase table for driver credentials. It never updates employee records, trip logs, expenses, cashbook data or document files. No Android reinstall is needed. Password hashes are preserved when imported. Existing sessions are intentionally revoked at cutover; durable tokens include the account-instance ID. Notifications remain unrelated and disabled.

Supabase mode reads authoritative records on every request, acknowledges password changes only after database confirmation, and uses a revision check so an older concurrent login cannot overwrite a newer password. There is no fallback to local JSON when Supabase is unavailable. Login verifies exactly the same password bytes used by password creation.

The mode is opt-in so simply deploying this code before setup does not lock everyone out. Local mode is transitional/development only and DOES NOT solve Render redeploy persistence.

## Approved alternative: fresh driver accounts without Render Shell

The owner approved creating fresh driver passwords once because Render Free has no Shell access. The SQL table was created successfully according to the owner's report. This path does not require importing the old credential file.

1. Confirm the Render environment has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the project where the SQL ran. Enter secrets only in Render. Keep the existing signing secret unchanged.
2. Merge this tested fix, set DRIVER_AUTH_STORE=supabase, and deploy the merged revision. Schedule the cutover when drivers can sign in again. Do not delete any existing Supabase accounts or import the tracked JSON snapshot.
3. In the website employee directory, open Driver App Access for each existing driver. Create app access if no durable account exists. Keep the same employee and permanent code. Share its newly generated temporary password privately.
4. Sign in on the phone and choose a permanent password once. Sign out and sign in twice using that chosen password. Verify again after the next controlled Render restart/deploy.
5. If any account already exists in Supabase, do not recreate or overwrite it. Use its current password or the normal authorized office reset action if needed.

All legacy sessions are rejected in durable mode because they lack the account-instance claim. Recreated accounts have new IDs, so prior tokens cannot regain access even if password versions match. No SQL change beyond the supplied table creation is needed. No Android reinstall is needed for this server fix. Live activation still needs verification.

## Optional alternative — preserve current passwords with Shell access

1. In the website's Supabase SQL Editor, run `ops/driver-auth-persistence.sql`. It creates only `public.jbc_driver_accounts`, with RLS enabled and no client access. The Android app must never receive the service-role key. If a table with this name already exists, review its schema/permissions before proceeding.
2. Confirm Render already has the correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for this Supabase project. A public/anon key is insufficient. Enter keys directly in Render; do not send them in chat or commit them. Keep the existing JWT secret unchanged.
3. Before ANY redeploy, preserve/import the CURRENT LIVE `driver_app_accounts.json`. Do not use the tracked GitHub copy or a desktop backup. Schedule a short period with no office account edits/password resets or driver password changes during migration and activation.
4. On the current Render instance, fetch the reviewed fix branch into a separate temporary directory. Do not change the running website checkout. For example, from the current website repository root in Render Shell:

```sh
git clone --depth 1 --branch codex/driver-password-persistence https://github.com/munnarathod222/my-awesome-website.git /tmp/jbc-password-migration
node /tmp/jbc-password-migration/ops/import-driver-accounts.mjs "${DATA_DIR:-$PWD/data}/driver_app_accounts.json" --apply
```

Check the actual live DATA_DIR first; the fallback shown matches the repository-root data directory only. If the temporary directory already exists, inspect/reuse it rather than deleting it blindly. The import reports counts only, never credentials. It creates missing accounts and NEVER overwrites an existing Supabase account. Partial imports can be resumed, but conflicts require review. If the live file has already been lost, its newest password hashes cannot be recovered from the old repository copy; use a verified private backup or explicitly re-establish the affected accounts once after durable storage is active.

5. Verify the number of imported/existing rows matches the live driver account count, without displaying hashes. Merge the reviewed PR, set `DRIVER_AUTH_STORE=supabase` in Render, and deploy that merged revision. Do not enable this setting before the table and account import succeed. Do not automatically import local JSON during startup.
6. On the driver's phone, sign in with the existing chosen password, close/reopen the app and sign in again after signing out. Then perform a controlled Render restart and repeat. Do not test with a real driver's password in shell commands or logs. Confirm temporary-password restrictions, account disable and password reset revocation still work. Existing passwords should need no change when the live hashes were imported correctly.
7. After successful cutover, retire the tracked credential snapshot and keep private backups under the existing retention policy. Do not revert to that snapshot for rollback; it contains historical credential state. This PR intentionally does not delete the live migration source.

## Validation

Run `node --test apps/api/tests/driverPasswordPersistence.test.mjs`.
The tests use synthetic accounts and a fake PostgREST adapter only. They cover repeated login, logout, restart/redeploy, unavailable storage, failed saves, concurrent reset protection, exact password bytes, lockout, disable and refresh revocation. Real Supabase SQL/RLS execution and Render cutover remain deployment acceptance steps, not claims established by the local tests.

## Failure and rollback

Storage errors return 503, not a wrong-password error or false success. Revision conflicts return 409 and can be retried. Keep `DRIVER_AUTH_STORE=supabase` while fixing connection/configuration issues; falling back to a historical file could restore old passwords and revoked sessions. Roll back application code only to a version that supports the durable store, or stop driver login temporarily while repairing it. Never overwrite durable accounts from an older export.
