-- ==============================================================================
-- JAI BHAVANI CARGO - ADVANCED LOGISTICS SYSTEM
-- SUPABASE POSTGRESQL PRODUCTION MIGRATION SCHEMA
-- ==============================================================================
-- Preserves PocketBase 15-character text IDs, exact relational linkages,
-- permanent employee codes, auditable financial precision, and Row-Level Security.
-- Never exposes service_role credentials to frontend or mobile client.
-- ==============================================================================

-- Enable UUID and Cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Persistent Driver Accounts Store (Required by driverAccountStore.js)
CREATE TABLE IF NOT EXISTS public.jbc_driver_accounts (
    employee_id TEXT PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    revision BIGINT NOT NULL DEFAULT 1,
    account JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_jbc_driver_accounts_code ON public.jbc_driver_accounts(employee_code);
ALTER TABLE public.jbc_driver_accounts ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 1. CORE MASTER TABLES
-- ==============================================================================

-- Employees & Drivers Master
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    employee_code TEXT UNIQUE,
    employee_type TEXT NOT NULL DEFAULT 'driver', -- 'driver' | 'staff' | 'manager'
    contact TEXT,
    phone TEXT,
    email TEXT,
    position TEXT,
    salary NUMERIC(14,2) DEFAULT 0,
    daily_rate NUMERIC(14,2) DEFAULT 0,
    monthly_salary NUMERIC(14,2) DEFAULT 0,
    fixed_salary NUMERIC(14,2) DEFAULT 0,
    active_status TEXT NOT NULL DEFAULT 'active',
    assigned_truck TEXT,
    supervisor_id TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    notes TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Fleet Trucks Master
CREATE TABLE IF NOT EXISTS public.trucks (
    id TEXT PRIMARY KEY,
    truck_number TEXT NOT NULL UNIQUE,
    truck_name TEXT,
    model TEXT,
    truck_size TEXT,
    truck_axle TEXT,
    payload_capacity NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'active',
    ownership_type TEXT DEFAULT 'Owned',
    owner_name TEXT,
    driver_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    manager_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    base_odometer NUMERIC(12,2) DEFAULT 0,
    current_odometer NUMERIC(12,2) DEFAULT 0,
    expected_mileage NUMERIC(6,2),
    fastag_provider TEXT,
    fastag_status TEXT,
    current_fastag_balance NUMERIC(12,2) DEFAULT 0,
    last_recharge_date TIMESTAMPTZ,
    chassis_number TEXT,
    engine_number TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Client Master
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    company_name TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    gstin TEXT,
    pan TEXT,
    billing_address TEXT,
    standard_credit_period_days INTEGER DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'Active',
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Routes & Corridors
CREATE TABLE IF NOT EXISTS public.routes (
    id TEXT PRIMARY KEY,
    route_name TEXT NOT NULL,
    route_code TEXT,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km NUMERIC(10,2) DEFAULT 0,
    standard_rate NUMERIC(14,2) DEFAULT 0,
    standard_toll NUMERIC(10,2) DEFAULT 0,
    standard_fuel_ltr NUMERIC(10,2) DEFAULT 0,
    standard_transit_hours NUMERIC(6,2) DEFAULT 0,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 2. TRIP OPERATIONS & DISPATCH
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.trip_logs (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL,
    date DATE NOT NULL,
    truck_id TEXT REFERENCES public.trucks(id) ON DELETE SET NULL,
    truck_number TEXT NOT NULL,
    driver_employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    driver_employee_code TEXT,
    driver_name TEXT,
    client_id TEXT REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    route_id TEXT REFERENCES public.routes(id) ON DELETE SET NULL,
    route TEXT NOT NULL,
    origin TEXT,
    destination TEXT,
    kms NUMERIC(10,2) DEFAULT 0,
    revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
    advance_received_from_client NUMERIC(14,2) DEFAULT 0,
    advance_paid_to_driver NUMERIC(14,2) DEFAULT 0,
    toll_deduction NUMERIC(10,2) DEFAULT 0,
    vendor_payout NUMERIC(14,2) DEFAULT 0,
    tds_deducted_receivable NUMERIC(14,2) DEFAULT 0,
    client_payment_status TEXT NOT NULL DEFAULT 'pending',
    trip_status TEXT NOT NULL DEFAULT 'Upcoming', -- 'Upcoming' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled'
    actual_start_time TIMESTAMPTZ,
    delivery_eta TIMESTAMPTZ,
    delivered_time TIMESTAMPTZ,
    delivery_actual_time TIMESTAMPTZ,
    cargo_details TEXT,
    pod_file TEXT,
    pod_uploaded_at TIMESTAMPTZ,
    pod_status TEXT DEFAULT 'Pending Verification',
    pod_sha256 TEXT,
    pod_verified BOOLEAN DEFAULT false,
    pod_verified_at TIMESTAMPTZ,
    pod_verified_by TEXT,
    created_by TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_trip_logs_driver_id ON public.trip_logs(driver_employee_id);
CREATE INDEX IF NOT EXISTS idx_trip_logs_driver_code ON public.trip_logs(driver_employee_code);
CREATE INDEX IF NOT EXISTS idx_trip_logs_date ON public.trip_logs(date);
CREATE INDEX IF NOT EXISTS idx_trip_logs_status ON public.trip_logs(trip_status);

-- ==============================================================================
-- 3. FINANCIAL TRANSACTIONS & CASHBOOK
-- ==============================================================================

-- General Cashbook Ledger
CREATE TABLE IF NOT EXISTS public.cashbook (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    transaction_type TEXT NOT NULL, -- 'Income' | 'Expense' | 'Transfer' | 'Adjustment'
    category TEXT NOT NULL,
    sub_category TEXT,
    payment_mode TEXT DEFAULT 'Cash',
    reference_id TEXT,
    reference_type TEXT,
    added_by TEXT,
    status TEXT NOT NULL DEFAULT 'Completed',
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cashbook_date ON public.cashbook(date);
CREATE INDEX IF NOT EXISTS idx_cashbook_ref ON public.cashbook(reference_id);

-- Operational Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Paid',
    payment_mode TEXT DEFAULT 'Cash',
    payment_method TEXT,
    payment_reference TEXT,
    truck_id TEXT REFERENCES public.trucks(id) ON DELETE SET NULL,
    truck_number TEXT,
    trip_id TEXT REFERENCES public.trip_logs(id) ON DELETE SET NULL,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    submitted_by_employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    receipt_file TEXT,
    receipt_sha256 TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_expenses_emp ON public.expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_submitter ON public.expenses(submitted_by_employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_truck ON public.expenses(truck_id);

-- Staff & Driver Advances
CREATE TABLE IF NOT EXISTS public.advances (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    remaining_balance NUMERIC(14,2) NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active' | 'Settled' | 'Partially Settled'
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    expense_id TEXT,
    settled_date DATE,
    notes TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_advances_emp ON public.advances(employee_id);

-- Attendance & Biometrics
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    staff_member TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Present', -- 'Present' | 'Absent' | 'Half Day' | 'Leave'
    check_in_time TEXT,
    check_out_time TEXT,
    hours_worked NUMERIC(5,2) DEFAULT 8.00,
    leave_type TEXT,
    notes TEXT,
    marked_by TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON public.attendance(staff_member, date);

-- ==============================================================================
-- 4. DOCUMENT VAULT & FLEET RECORDS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.truck_documents (
    id TEXT PRIMARY KEY,
    truck_id TEXT NOT NULL, -- Either specific truck id, or 'COMPANY_VAULT', or 'FLEET_RC_BUNDLE'
    document_type TEXT NOT NULL,
    document_name TEXT,
    document_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    file TEXT,
    file_sha256 TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    scope TEXT NOT NULL DEFAULT 'VEHICLE_SPECIFIC', -- 'VEHICLE_SPECIFIC' | 'COMPANY_VAULT' | 'FLEET_BUNDLE'
    notes TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.employee_documents (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT,
    document_number TEXT,
    issue_date DATE,
    expiry_date DATE,
    file TEXT,
    file_sha256 TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_emp_docs_emp ON public.employee_documents(employee_id);

-- ==============================================================================
-- 5. DRIVER MOBILE APP SECURITY & AUDIT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.driver_app_accounts (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL UNIQUE REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_code TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    account_status TEXT NOT NULL DEFAULT 'active',
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    password_version INTEGER NOT NULL DEFAULT 1,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'OPERATIONS',
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event_type, created_at);

-- ==============================================================================
-- 6. POSTGRESQL TRIGGERS (Replicating PocketBase pb_hooks)
-- ==============================================================================

-- A. Auto-sync Trip Payment into Cashbook
CREATE OR REPLACE FUNCTION public.fn_sync_trip_payment_to_cashbook()
RETURNS TRIGGER AS $$
DECLARE
    final_amount NUMERIC(14,2);
    existing_id TEXT;
BEGIN
    final_amount := COALESCE(NEW.revenue, 0) - COALESCE(NEW.advance_received_from_client, 0) - COALESCE(NEW.tds_deducted_receivable, 0);

    IF NEW.client_payment_status = 'received' THEN
        SELECT id INTO existing_id FROM public.cashbook WHERE reference_id = NEW.id AND reference_type = 'trip_payment' LIMIT 1;
        IF existing_id IS NOT NULL THEN
            IF final_amount > 0 THEN
                UPDATE public.cashbook
                SET amount = final_amount,
                    description = 'Final Payment Received - Trip ID: ' || COALESCE(NEW.trip_id, NEW.id) || ' (Net after TDS)',
                    updated = timezone('utc', now())
                WHERE id = existing_id;
            ELSE
                DELETE FROM public.cashbook WHERE id = existing_id;
            END IF;
        ELSE
            IF final_amount > 0 THEN
                INSERT INTO public.cashbook (
                    id, date, description, amount, transaction_type, category,
                    added_by, reference_id, reference_type, status, created, updated
                ) VALUES (
                    'cb_' || encode(gen_random_bytes(6), 'hex'),
                    NEW.date,
                    'Final Payment Received - Trip ID: ' || COALESCE(NEW.trip_id, NEW.id) || ' (Net after TDS)',
                    final_amount,
                    'Income',
                    'Trip Revenue',
                    COALESCE(NEW.created_by, 'System'),
                    NEW.id,
                    'trip_payment',
                    'Completed',
                    timezone('utc', now()),
                    timezone('utc', now())
                );
            END IF;
        END IF;
    ELSIF OLD.client_payment_status = 'received' AND NEW.client_payment_status <> 'received' THEN
        DELETE FROM public.cashbook WHERE reference_id = NEW.id AND reference_type = 'trip_payment';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_trip_payment_to_cashbook ON public.trip_logs;
CREATE TRIGGER trg_sync_trip_payment_to_cashbook
AFTER INSERT OR UPDATE ON public.trip_logs
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_trip_payment_to_cashbook();

-- B. Auto-sync Advances into Cashbook
CREATE OR REPLACE FUNCTION public.fn_sync_advance_to_cashbook()
RETURNS TRIGGER AS $$
DECLARE
    emp_name TEXT;
    existing_id TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        DELETE FROM public.cashbook WHERE reference_id = OLD.id AND reference_type = 'driver_advance';
        RETURN OLD;
    END IF;

    SELECT name INTO emp_name FROM public.employees WHERE id = NEW.employee_id;
    SELECT id INTO existing_id FROM public.cashbook WHERE reference_id = NEW.id AND reference_type = 'driver_advance' LIMIT 1;

    IF existing_id IS NOT NULL THEN
        UPDATE public.cashbook
        SET amount = NEW.amount,
            date = NEW.date,
            description = 'Advance Paid to ' || COALESCE(emp_name, 'Driver') || ' - ' || COALESCE(NEW.reason, 'General Advance'),
            updated = timezone('utc', now())
        WHERE id = existing_id;
    ELSE
        INSERT INTO public.cashbook (
            id, date, description, amount, transaction_type, category,
            added_by, reference_id, reference_type, status, created, updated
        ) VALUES (
            'cb_' || encode(gen_random_bytes(6), 'hex'),
            NEW.date,
            'Advance Paid to ' || COALESCE(emp_name, 'Driver') || ' - ' || COALESCE(NEW.reason, 'General Advance'),
            NEW.amount,
            'Expense',
            'Driver Advance',
            'Office',
            NEW.id,
            'driver_advance',
            'Completed',
            timezone('utc', now()),
            timezone('utc', now())
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_advance_to_cashbook ON public.advances;
CREATE TRIGGER trg_sync_advance_to_cashbook
AFTER INSERT OR UPDATE OR DELETE ON public.advances
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_advance_to_cashbook();

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.truck_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_app_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashbook ENABLE ROW LEVEL SECURITY;

-- Backend Service Role has full access (never exposed to client)
CREATE POLICY "service_role_all_employees" ON public.employees FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_trucks" ON public.trucks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_trips" ON public.trip_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_expenses" ON public.expenses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_advances" ON public.advances FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_attendance" ON public.attendance FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_truck_docs" ON public.truck_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_emp_docs" ON public.employee_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_driver_accs" ON public.driver_app_accounts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_cashbook" ON public.cashbook FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Driver App Data Access (Drivers can view only their own assigned records)
CREATE POLICY "driver_select_own_trips" ON public.trip_logs
FOR SELECT TO authenticated
USING (driver_employee_id = auth.uid()::text);

CREATE POLICY "driver_select_own_advances" ON public.advances
FOR SELECT TO authenticated
USING (employee_id = auth.uid()::text);

CREATE POLICY "driver_select_own_attendance" ON public.attendance
FOR SELECT TO authenticated
USING (staff_member = auth.uid()::text);

CREATE POLICY "driver_select_own_documents" ON public.employee_documents
FOR SELECT TO authenticated
USING (employee_id = auth.uid()::text);

CREATE POLICY "driver_select_own_expenses" ON public.expenses
FOR SELECT TO authenticated
USING (submitted_by_employee_id = auth.uid()::text);


-- ==============================================================================
-- 7. RECONCILED POCKETBASE BUSINESS COLLECTIONS & AUXILIARY LEDGERS
-- ==============================================================================

-- Persistent Driver Accounts Store (Required by driverAccountStore.js)
CREATE TABLE IF NOT EXISTS public.jbc_driver_accounts (
    employee_id TEXT PRIMARY KEY,
    employee_code TEXT UNIQUE NOT NULL,
    revision BIGINT NOT NULL DEFAULT 1,
    account JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
CREATE INDEX IF NOT EXISTS idx_jbc_driver_accounts_code ON public.jbc_driver_accounts(employee_code);
ALTER TABLE public.jbc_driver_accounts ENABLE ROW LEVEL SECURITY;

-- Collection: attendance_records
CREATE TABLE IF NOT EXISTS public."attendance_records" (
    id TEXT PRIMARY KEY,
    "employee_id" TEXT,
    "date" TIMESTAMPTZ,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."attendance_records" ENABLE ROW LEVEL SECURITY;

-- Collection: bids
CREATE TABLE IF NOT EXISTS public."bids" (
    id TEXT PRIMARY KEY,
    "date" TEXT,
    "bid_date" TEXT,
    "client_name" TEXT,
    "counterparty" TEXT,
    "role" TEXT,
    "underlying_client" TEXT,
    "bidding_type" TEXT,
    "bid_type" TEXT,
    "vehicle_type" TEXT,
    "truck_type" TEXT,
    "bidding_amount" NUMERIC,
    "quoted_amount" NUMERIC,
    "quoted_rate" NUMERIC,
    "bidding_lost_at" NUMERIC,
    "actual_winning_rate" NUMERIC,
    "trip_detail" TEXT,
    "starting_point" TEXT,
    "origin" TEXT,
    "ending_point" TEXT,
    "destination" TEXT,
    "no_of_stops" NUMERIC,
    "route_map" TEXT,
    "status" TEXT,
    "result" TEXT,
    "distance_km" NUMERIC,
    "payload_tons" NUMERIC,
    "trips_count" NUMERIC,
    "monthly_trips" NUMERIC,
    "contract_ref" TEXT,
    "contract_date" TEXT,
    "contract_months" NUMERIC,
    "dedicated_trucks" NUMERIC,
    "load_type" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."bids" ENABLE ROW LEVEL SECURITY;

-- Collection: billing_cycles
CREATE TABLE IF NOT EXISTS public."billing_cycles" (
    id TEXT PRIMARY KEY,
    "client_id" TEXT,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "expected_payout_date" TIMESTAMPTZ,
    "status" TEXT,
    "invoiced_amount" NUMERIC,
    "collected_amount" NUMERIC,
    "is_manually_overridden" BOOLEAN DEFAULT false,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."billing_cycles" ENABLE ROW LEVEL SECURITY;

-- Collection: bills
CREATE TABLE IF NOT EXISTS public."bills" (
    id TEXT PRIMARY KEY,
    "date" TIMESTAMPTZ,
    "amount" NUMERIC,
    "vendor" TEXT,
    "category" TEXT,
    "description" TEXT,
    "file" TEXT,
    "created_by" TEXT,
    "expense_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."bills" ENABLE ROW LEVEL SECURITY;

-- Collection: bulk_upload_history
CREATE TABLE IF NOT EXISTS public."bulk_upload_history" (
    id TEXT PRIMARY KEY,
    "upload_date" TEXT,
    "user_id" TEXT,
    "total_rows" NUMERIC,
    "successful_imports" NUMERIC,
    "failed_rows" NUMERIC,
    "error_details" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."bulk_upload_history" ENABLE ROW LEVEL SECURITY;

-- Collection: cashbook_transactions
CREATE TABLE IF NOT EXISTS public."cashbook_transactions" (
    id TEXT PRIMARY KEY,
    "cashbook_id" TEXT,
    "date" TIMESTAMPTZ,
    "description" TEXT,
    "category" TEXT,
    "amount" NUMERIC,
    "transaction_type" TEXT,
    "source_module" TEXT,
    "source_record_id" TEXT,
    "running_balance" NUMERIC,
    "created_at" TEXT,
    "updated_at" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."cashbook_transactions" ENABLE ROW LEVEL SECURITY;

-- Collection: cashbooks
CREATE TABLE IF NOT EXISTS public."cashbooks" (
    id TEXT PRIMARY KEY,
    "user_id" TEXT,
    "opening_balance" NUMERIC,
    "status" TEXT,
    "created_at" TEXT,
    "updated_at" TEXT,
    "employee_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."cashbooks" ENABLE ROW LEVEL SECURITY;

-- Collection: client_invoices
CREATE TABLE IF NOT EXISTS public."client_invoices" (
    id TEXT PRIMARY KEY,
    "client_id" TEXT,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMPTZ,
    "due_date" TIMESTAMPTZ,
    "amount" NUMERIC,
    "paid_amount" NUMERIC,
    "balance" NUMERIC,
    "payment_status" TEXT,
    "payment_method" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."client_invoices" ENABLE ROW LEVEL SECURITY;

-- Collection: client_payments
CREATE TABLE IF NOT EXISTS public."client_payments" (
    id TEXT PRIMARY KEY,
    "client_id" TEXT,
    "invoice_id" TEXT,
    "payment_date" TIMESTAMPTZ,
    "amount" NUMERIC,
    "payment_method" TEXT,
    "reference_number" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."client_payments" ENABLE ROW LEVEL SECURITY;

-- Collection: client_shipments
CREATE TABLE IF NOT EXISTS public."client_shipments" (
    id TEXT PRIMARY KEY,
    "client_id" TEXT,
    "shipment_id" TEXT,
    "shipment_date" TIMESTAMPTZ,
    "delivery_date" TIMESTAMPTZ,
    "shipment_status" TEXT,
    "amount" NUMERIC,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."client_shipments" ENABLE ROW LEVEL SECURITY;

-- Collection: company_settings
CREATE TABLE IF NOT EXISTS public."company_settings" (
    id TEXT PRIMARY KEY,
    "company_name" TEXT,
    "company_logo" TEXT,
    "company_address" TEXT,
    "company_phone" TEXT,
    "company_email" TEXT,
    "company_website" TEXT,
    "company_gstin" TEXT,
    "bank_name" TEXT,
    "account_name" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "branch_name" TEXT,
    "pan_number" TEXT,
    "tan_number" TEXT,
    "cin_number" TEXT,
    "msme_number" TEXT,
    "udyam_number" TEXT,
    "company_docs_json" TEXT,
    "e_signature" TEXT,
    "signatory_name" TEXT,
    "signatory_title" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."company_settings" ENABLE ROW LEVEL SECURITY;

-- Collection: contacts
CREATE TABLE IF NOT EXISTS public."contacts" (
    id TEXT PRIMARY KEY,
    "contact_type" TEXT,
    "company_name" TEXT,
    "phone_number" TEXT,
    "physical_address" TEXT,
    "gstin" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "truck_brand" TEXT,
    "warehouse_name" TEXT,
    "designation" TEXT,
    "client_name" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."contacts" ENABLE ROW LEVEL SECURITY;

-- Collection: contracts
CREATE TABLE IF NOT EXISTS public."contracts" (
    id TEXT PRIMARY KEY,
    "client_name" TEXT,
    "contract_ref" TEXT,
    "start_date" TEXT,
    "end_date" TEXT,
    "monthly_revenue" NUMERIC,
    "dedicated_trucks" NUMERIC,
    "status" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."contracts" ENABLE ROW LEVEL SECURITY;

-- Collection: credit_cards
CREATE TABLE IF NOT EXISTS public."credit_cards" (
    id TEXT PRIMARY KEY,
    "card_name" TEXT,
    "card_number_last4" TEXT,
    "card_type" TEXT,
    "bank_name" TEXT,
    "billing_cycle_start" NUMERIC,
    "billing_cycle_end" NUMERIC,
    "credit_limit" NUMERIC,
    "status" TEXT,
    "user_id" TEXT,
    "max_waiver_per_transaction" NUMERIC,
    "monthly_waiver_limit" NUMERIC,
    "current_month_waiver_used" NUMERIC,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."credit_cards" ENABLE ROW LEVEL SECURITY;

-- Collection: delivery_proofs
CREATE TABLE IF NOT EXISTS public."delivery_proofs" (
    id TEXT PRIMARY KEY,
    "trip_id" TEXT,
    "document_type" TEXT,
    "reference_number" TEXT,
    "description" TEXT,
    "files" TEXT,
    "uploaded_by" TEXT,
    "upload_date" TEXT,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."delivery_proofs" ENABLE ROW LEVEL SECURITY;

-- Collection: driver_accident_reports
CREATE TABLE IF NOT EXISTS public."driver_accident_reports" (
    id TEXT PRIMARY KEY,
    "employee_id" TEXT,
    "truck_id" TEXT,
    "trip_id" TEXT,
    "accident_date" TIMESTAMPTZ,
    "description" TEXT,
    "damage_cost" NUMERIC,
    "image_urls" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."driver_accident_reports" ENABLE ROW LEVEL SECURITY;

-- Collection: driver_applications
CREATE TABLE IF NOT EXISTS public."driver_applications" (
    id TEXT PRIMARY KEY,
    "applicant_role" TEXT,
    "full_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "dob" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pan_number" TEXT,
    "qualification" TEXT,
    "license_number" TEXT,
    "license_type" TEXT,
    "license_expiry" TEXT,
    "experience_years" NUMERIC,
    "previous_employer" TEXT,
    "previous_designation" TEXT,
    "reference1_name" TEXT,
    "reference1_phone" TEXT,
    "reference1_relation" TEXT,
    "reference2_name" TEXT,
    "reference2_phone" TEXT,
    "reference2_relation" TEXT,
    "vehicle_types" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "applied_date" TEXT,
    "license_file" TEXT,
    "photo_file" TEXT,
    "pan_file" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."driver_applications" ENABLE ROW LEVEL SECURITY;

-- Collection: driver_ledger
CREATE TABLE IF NOT EXISTS public."driver_ledger" (
    id TEXT PRIMARY KEY,
    "driver_id" TEXT,
    "trip_id" TEXT,
    "route_rate" NUMERIC,
    "advance_paid" NUMERIC,
    "balance_due" NUMERIC,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."driver_ledger" ENABLE ROW LEVEL SECURITY;

-- Collection: driver_remarks
CREATE TABLE IF NOT EXISTS public."driver_remarks" (
    id TEXT PRIMARY KEY,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."driver_remarks" ENABLE ROW LEVEL SECURITY;

-- Collection: exit_audits
CREATE TABLE IF NOT EXISTS public."exit_audits" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "driver_id" TEXT,
    "audit_date" TIMESTAMPTZ,
    "body_damages_notes" TEXT,
    "body_damages_images" TEXT,
    "battery_serial_verified" BOOLEAN DEFAULT false,
    "battery_image_snapshot" TEXT,
    "tyre_axle_layout_verified" JSONB,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."exit_audits" ENABLE ROW LEVEL SECURITY;

-- Collection: expenses_driver_advance
CREATE TABLE IF NOT EXISTS public."expenses_driver_advance" (
    id TEXT PRIMARY KEY,
    "amount" NUMERIC,
    "location" TEXT,
    "payment_mode" TEXT,
    "driver_name" TEXT,
    "date" TIMESTAMPTZ,
    "created_by" TEXT,
    "bill" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."expenses_driver_advance" ENABLE ROW LEVEL SECURITY;

-- Collection: expenses_fastag
CREATE TABLE IF NOT EXISTS public."expenses_fastag" (
    id TEXT PRIMARY KEY,
    "amount" NUMERIC,
    "truck_number" TEXT,
    "payment_mode" TEXT,
    "date" TIMESTAMPTZ,
    "created_by" TEXT,
    "bill" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."expenses_fastag" ENABLE ROW LEVEL SECURITY;

-- Collection: expenses_fuel
CREATE TABLE IF NOT EXISTS public."expenses_fuel" (
    id TEXT PRIMARY KEY,
    "amount" NUMERIC,
    "liters" NUMERIC,
    "fuel_station_name" TEXT,
    "photo" TEXT,
    "date" TIMESTAMPTZ,
    "created_by" TEXT,
    "photos" TEXT,
    "truck_number" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."expenses_fuel" ENABLE ROW LEVEL SECURITY;

-- Collection: expenses_maintenance
CREATE TABLE IF NOT EXISTS public."expenses_maintenance" (
    id TEXT PRIMARY KEY,
    "service" TEXT,
    "truck_number" TEXT,
    "amount" NUMERIC,
    "payment_mode" TEXT,
    "date" TIMESTAMPTZ,
    "created_by" TEXT,
    "bill" TEXT,
    "service_provider_name" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."expenses_maintenance" ENABLE ROW LEVEL SECURITY;

-- Collection: expenses_miscellaneous
CREATE TABLE IF NOT EXISTS public."expenses_miscellaneous" (
    id TEXT PRIMARY KEY,
    "expense_description" TEXT,
    "truck_number" TEXT,
    "amount" NUMERIC,
    "payment_mode" TEXT,
    "date" TIMESTAMPTZ,
    "created_by" TEXT,
    "bill" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."expenses_miscellaneous" ENABLE ROW LEVEL SECURITY;

-- Collection: fastag_recharges
CREATE TABLE IF NOT EXISTS public."fastag_recharges" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "recharge_date" TIMESTAMPTZ,
    "recharge_amount" NUMERIC,
    "payment_method" TEXT,
    "reference_number" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."fastag_recharges" ENABLE ROW LEVEL SECURITY;

-- Collection: fastag_transactions
CREATE TABLE IF NOT EXISTS public."fastag_transactions" (
    id TEXT PRIMARY KEY,
    "truck_number" TEXT,
    "transaction_type" TEXT,
    "amount" NUMERIC,
    "trip_code" TEXT,
    "date" TIMESTAMPTZ,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."fastag_transactions" ENABLE ROW LEVEL SECURITY;

-- Collection: fuel_investigations
CREATE TABLE IF NOT EXISTS public."fuel_investigations" (
    id TEXT PRIMARY KEY,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."fuel_investigations" ENABLE ROW LEVEL SECURITY;

-- Collection: fuel_payments
CREATE TABLE IF NOT EXISTS public."fuel_payments" (
    id TEXT PRIMARY KEY,
    "date" TIMESTAMPTZ,
    "card_id" TEXT,
    "fuel_amount" NUMERIC,
    "surcharge_percentage" NUMERIC,
    "surcharge_amount" NUMERIC,
    "payment_status" TEXT,
    "waived_amount" NUMERIC,
    "notes" TEXT,
    "user_id" TEXT,
    "month" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."fuel_payments" ENABLE ROW LEVEL SECURITY;

-- Collection: fuel_tracker
CREATE TABLE IF NOT EXISTS public."fuel_tracker" (
    id TEXT PRIMARY KEY,
    "date" TIMESTAMPTZ,
    "truck_id" TEXT,
    "truck_number" TEXT,
    "distance_driven" NUMERIC,
    "liters" NUMERIC,
    "total_cost" NUMERIC,
    "payment_method" TEXT,
    "credit_card_id" TEXT,
    "notes" TEXT,
    "expected_mileage" NUMERIC,
    "efficiency_drop_pct" NUMERIC,
    "excess_liters_lost" NUMERIC,
    "financial_loss_inr" NUMERIC,
    "is_anomaly" BOOLEAN DEFAULT false,
    "investigation_status" TEXT,
    "root_causes" TEXT,
    "investigation_notes" TEXT,
    "action_taken" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."fuel_tracker" ENABLE ROW LEVEL SECURITY;

-- Collection: inventory_items
CREATE TABLE IF NOT EXISTS public."inventory_items" (
    id TEXT PRIMARY KEY,
    "item_name" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "current_stock" NUMERIC,
    "reorder_level" NUMERIC,
    "unit_cost" NUMERIC,
    "supplier_name" TEXT,
    "last_restocked_date" TIMESTAMPTZ,
    "description" TEXT,
    "created_by" TEXT,
    "image_urls" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."inventory_items" ENABLE ROW LEVEL SECURITY;

-- Collection: inventory_value_snapshots
CREATE TABLE IF NOT EXISTS public."inventory_value_snapshots" (
    id TEXT PRIMARY KEY,
    "snapshot_date" TIMESTAMPTZ,
    "total_value" NUMERIC,
    "category" TEXT,
    "items_count" NUMERIC,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."inventory_value_snapshots" ENABLE ROW LEVEL SECURITY;

-- Collection: invitations
CREATE TABLE IF NOT EXISTS public."invitations" (
    id TEXT PRIMARY KEY,
    "email" TEXT,
    "role" TEXT,
    "invited_by" TEXT,
    "invitation_token" TEXT,
    "status" TEXT,
    "expires_at" TIMESTAMPTZ,
    "created_at" TEXT,
    "accepted_at" TIMESTAMPTZ,
    "created_by" TEXT,
    "invited_by_name" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."invitations" ENABLE ROW LEVEL SECURITY;

-- Collection: invoices
CREATE TABLE IF NOT EXISTS public."invoices" (
    id TEXT PRIMARY KEY,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMPTZ,
    "due_date" TIMESTAMPTZ,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_address" TEXT,
    "customer_phone" TEXT,
    "company_name" TEXT,
    "company_address" TEXT,
    "company_phone" TEXT,
    "company_email" TEXT,
    "company_logo" TEXT,
    "line_items" JSONB,
    "subtotal" NUMERIC,
    "tax_percentage" NUMERIC,
    "tax_amount" NUMERIC,
    "discount_percentage" NUMERIC,
    "discount_amount" NUMERIC,
    "total_amount" NUMERIC,
    "payment_terms" TEXT,
    "bank_details" TEXT,
    "notes" TEXT,
    "status" TEXT,
    "quote_reference" TEXT,
    "created_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."invoices" ENABLE ROW LEVEL SECURITY;

-- Collection: loan_profiles
CREATE TABLE IF NOT EXISTS public."loan_profiles" (
    id TEXT PRIMARY KEY,
    "profileName" TEXT,
    "loanAmount" NUMERIC,
    "interestRate" NUMERIC,
    "loanTerm" NUMERIC,
    "userId" TEXT,
    "isDefault" BOOLEAN DEFAULT false,
    "createdAt" TEXT,
    "updatedAt" TEXT,
    "disbursal_date" TIMESTAMPTZ,
    "first_emi_date" TIMESTAMPTZ,
    "bank_name" TEXT,
    "loan_document" TEXT,
    "truck_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."loan_profiles" ENABLE ROW LEVEL SECURITY;

-- Collection: maintenance_logs
CREATE TABLE IF NOT EXISTS public."maintenance_logs" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "category" TEXT,
    "date" TIMESTAMPTZ,
    "mileage" NUMERIC,
    "technician_name" TEXT,
    "notes" TEXT,
    "created_at" TEXT,
    "updated_at" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."maintenance_logs" ENABLE ROW LEVEL SECURITY;

-- Collection: maintenance_problems
CREATE TABLE IF NOT EXISTS public."maintenance_problems" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "description" TEXT,
    "category" TEXT,
    "severity" TEXT,
    "date_reported" TIMESTAMPTZ,
    "status" TEXT,
    "assigned_technician" TEXT,
    "resolution_notes" TEXT,
    "created_at" TEXT,
    "updated_at" TEXT,
    "date_solved" TIMESTAMPTZ,
    "image_urls" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."maintenance_problems" ENABLE ROW LEVEL SECURITY;

-- Collection: maintenance_records
CREATE TABLE IF NOT EXISTS public."maintenance_records" (
    id TEXT PRIMARY KEY,
    "maintenance_schedule_id" TEXT,
    "vehicle_id" TEXT,
    "completion_date" TIMESTAMPTZ,
    "actual_cost" NUMERIC,
    "technician_id" TEXT,
    "completion_notes" TEXT,
    "attachments" TEXT,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."maintenance_records" ENABLE ROW LEVEL SECURITY;

-- Collection: maintenance_reminders
CREATE TABLE IF NOT EXISTS public."maintenance_reminders" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "maintenance_type" TEXT,
    "reminder_date" TIMESTAMPTZ,
    "status" TEXT,
    "created_at" TEXT,
    "updated_at" TEXT,
    "notes" TEXT,
    "month_label" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."maintenance_reminders" ENABLE ROW LEVEL SECURITY;

-- Collection: maintenance_schedules
CREATE TABLE IF NOT EXISTS public."maintenance_schedules" (
    id TEXT PRIMARY KEY,
    "vehicle_id" TEXT,
    "maintenance_type" TEXT,
    "maintenance_interval_km" NUMERIC,
    "maintenance_interval_months" NUMERIC,
    "next_maintenance_date" TIMESTAMPTZ,
    "estimated_cost" NUMERIC,
    "priority_level" TEXT,
    "assigned_technician" TEXT,
    "notes" TEXT,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."maintenance_schedules" ENABLE ROW LEVEL SECURITY;

-- Collection: monthly_inspections
CREATE TABLE IF NOT EXISTS public."monthly_inspections" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "inspection_date" TIMESTAMPTZ,
    "inspector_name" TEXT,
    "pass_fail_toggles" JSONB,
    "inspector_notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."monthly_inspections" ENABLE ROW LEVEL SECURITY;

-- Collection: parts_installed
CREATE TABLE IF NOT EXISTS public."parts_installed" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "part_name" TEXT,
    "description" TEXT,
    "serial_number" TEXT,
    "installation_date" TIMESTAMPTZ,
    "warranty_start_date" TIMESTAMPTZ,
    "warranty_expiration_date" TIMESTAMPTZ,
    "cost" NUMERIC,
    "supplier_name" TEXT,
    "invoice_file" TEXT,
    "created_at" TEXT,
    "updated_at" TEXT,
    "image_urls" TEXT,
    "part_number" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."parts_installed" ENABLE ROW LEVEL SECURITY;

-- Collection: payment_due_dates
CREATE TABLE IF NOT EXISTS public."payment_due_dates" (
    id TEXT PRIMARY KEY,
    "card_id" TEXT,
    "payment_due_date" NUMERIC,
    "minimum_payment_amount" NUMERIC,
    "full_payment_amount" NUMERIC,
    "user_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."payment_due_dates" ENABLE ROW LEVEL SECURITY;

-- Collection: payment_records
CREATE TABLE IF NOT EXISTS public."payment_records" (
    id TEXT PRIMARY KEY,
    "card_id" TEXT,
    "payment_date" TIMESTAMPTZ,
    "amount_paid" NUMERIC,
    "payment_method" TEXT,
    "reference_number" TEXT,
    "fuel_payment_id" TEXT,
    "user_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."payment_records" ENABLE ROW LEVEL SECURITY;

-- Collection: payment_requests
CREATE TABLE IF NOT EXISTS public."payment_requests" (
    id TEXT PRIMARY KEY,
    "trip_id" TEXT,
    "client_id" TEXT,
    "amount" NUMERIC,
    "request_date" TIMESTAMPTZ,
    "due_date" TIMESTAMPTZ,
    "status" TEXT,
    "notes" TEXT,
    "payment_method" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."payment_requests" ENABLE ROW LEVEL SECURITY;

-- Collection: payroll
CREATE TABLE IF NOT EXISTS public."payroll" (
    id TEXT PRIMARY KEY,
    "payroll_month" NUMERIC,
    "payroll_year" NUMERIC,
    "employee_id" TEXT,
    "employee_name" TEXT,
    "designation" TEXT,
    "base_salary" NUMERIC,
    "trip_bonus" NUMERIC,
    "attendance_deduction" NUMERIC,
    "driver_advances" NUMERIC,
    "net_salary" NUMERIC,
    "payment_status" TEXT,
    "payment_date" TIMESTAMPTZ,
    "payment_mode" TEXT,
    "remarks" TEXT,
    "employee_id_relation" TEXT,
    "daily_rate" NUMERIC,
    "attendance_days" NUMERIC,
    "total_salary" NUMERIC,
    "deductions_breakdown" JSONB,
    "allowances_breakdown" JSONB,
    "gross_salary" NUMERIC,
    "taxes" NUMERIC,
    "status" TEXT,
    "created_date" TEXT,
    "updated_date" TEXT,
    "present_days" NUMERIC,
    "absent_days" NUMERIC,
    "leave_days" NUMERIC,
    "advance_deductions" JSONB,
    "advance_ids" TEXT,
    "advance_deductions_details" JSONB,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."payroll" ENABLE ROW LEVEL SECURITY;

-- Collection: planned_surcharge_payments
CREATE TABLE IF NOT EXISTS public."planned_surcharge_payments" (
    id TEXT PRIMARY KEY,
    "user_id" TEXT,
    "payment_date" TIMESTAMPTZ,
    "expected_surcharge_amount" NUMERIC,
    "payment_method" TEXT,
    "notes" TEXT,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."planned_surcharge_payments" ENABLE ROW LEVEL SECURITY;

-- Collection: quotes
CREATE TABLE IF NOT EXISTS public."quotes" (
    id TEXT PRIMARY KEY,
    "quote_number" TEXT,
    "customer_name" TEXT,
    "customer_email" TEXT,
    "customer_phone" TEXT,
    "origin" TEXT,
    "destination" TEXT,
    "destination_zone" TEXT,
    "container_type" TEXT,
    "actual_weight" NUMERIC,
    "length" NUMERIC,
    "width" NUMERIC,
    "height" NUMERIC,
    "volumetric_weight" NUMERIC,
    "chargeable_weight" NUMERIC,
    "base_rate_per_kg" NUMERIC,
    "zone_distance_multiplier" NUMERIC,
    "fuel_surcharge" NUMERIC,
    "handling_fees" NUMERIC,
    "weight_charge" NUMERIC,
    "total_price" NUMERIC,
    "status" TEXT,
    "notes" TEXT,
    "created_by" TEXT,
    "truck_size" TEXT,
    "custom_vehicle_requirement" TEXT,
    "service_type" TEXT,
    "material_type" TEXT,
    "expected_dispatch_date" TEXT,
    "details" TEXT,
    "company_name" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."quotes" ENABLE ROW LEVEL SECURITY;

-- Collection: reminders
CREATE TABLE IF NOT EXISTS public."reminders" (
    id TEXT PRIMARY KEY,
    "title" TEXT,
    "description" TEXT,
    "reminder_date" TIMESTAMPTZ,
    "reminder_time" TEXT,
    "category" TEXT,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurrence_type" TEXT,
    "is_completed" BOOLEAN DEFAULT false,
    "created_by" TEXT,
    "priority" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "user_id" TEXT,
    "linked_document_id" TEXT,
    "linked_card_id" TEXT,
    "snooze_until_date" TIMESTAMPTZ,
    "reminder_type" TEXT,
    "truck_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."reminders" ENABLE ROW LEVEL SECURITY;

-- Collection: restock_history
CREATE TABLE IF NOT EXISTS public."restock_history" (
    id TEXT PRIMARY KEY,
    "inventory_item_id" TEXT,
    "quantity_added" NUMERIC,
    "cost_per_unit" NUMERIC,
    "total_cost" NUMERIC,
    "supplier_name" TEXT,
    "date_received" TIMESTAMPTZ,
    "notes" TEXT,
    "restocked_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."restock_history" ENABLE ROW LEVEL SECURITY;

-- Collection: salary_payments
CREATE TABLE IF NOT EXISTS public."salary_payments" (
    id TEXT PRIMARY KEY,
    "employee_id" TEXT,
    "amount" NUMERIC,
    "payment_date" TIMESTAMPTZ,
    "billing_cycle" TEXT,
    "advances_deducted" NUMERIC,
    "net_amount" NUMERIC,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."salary_payments" ENABLE ROW LEVEL SECURITY;

-- Collection: sales_leads
CREATE TABLE IF NOT EXISTS public."sales_leads" (
    id TEXT PRIMARY KEY,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."sales_leads" ENABLE ROW LEVEL SECURITY;

-- Collection: service_intervals
CREATE TABLE IF NOT EXISTS public."service_intervals" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "component_name" TEXT,
    "target_interval_kms" NUMERIC,
    "last_serviced_odometer" NUMERIC,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."service_intervals" ENABLE ROW LEVEL SECURITY;

-- Collection: service_logs
CREATE TABLE IF NOT EXISTS public."service_logs" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "maintenance_date" TIMESTAMPTZ,
    "odometer_at_service" NUMERIC,
    "work_description_text" TEXT,
    "parts_replaced_array" JSONB,
    "cost_amount" NUMERIC,
    "invoice_file" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."service_logs" ENABLE ROW LEVEL SECURITY;

-- Collection: shared_folders
CREATE TABLE IF NOT EXISTS public."shared_folders" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "employee_id" TEXT,
    "created_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."shared_folders" ENABLE ROW LEVEL SECURITY;

-- Collection: signup_requests
CREATE TABLE IF NOT EXISTS public."signup_requests" (
    id TEXT PRIMARY KEY,
    "email" TEXT,
    "full_name" TEXT,
    "company_name" TEXT,
    "phone" TEXT,
    "reason" TEXT,
    "status" TEXT,
    "requested_date" TEXT,
    "approved_date" TIMESTAMPTZ,
    "approved_by" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."signup_requests" ENABLE ROW LEVEL SECURITY;

-- Collection: stock_deductions
CREATE TABLE IF NOT EXISTS public."stock_deductions" (
    id TEXT PRIMARY KEY,
    "inventory_item_id" TEXT,
    "truck_id" TEXT,
    "quantity_deducted" NUMERIC,
    "reason" TEXT,
    "notes" TEXT,
    "deducted_by" TEXT,
    "deduction_date" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."stock_deductions" ENABLE ROW LEVEL SECURITY;

-- Collection: subcontractor_vendors
CREATE TABLE IF NOT EXISTS public."subcontractor_vendors" (
    id TEXT PRIMARY KEY,
    "issued_jbc_vendor_id" TEXT,
    "subcontractor_name" TEXT,
    "owner_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "attached_trucks_count" NUMERIC,
    "truck_numbers" TEXT,
    "commission_rate" TEXT,
    "bank_name" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "status" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."subcontractor_vendors" ENABLE ROW LEVEL SECURITY;

-- Collection: todos
CREATE TABLE IF NOT EXISTS public."todos" (
    id TEXT PRIMARY KEY,
    "title" TEXT,
    "description" TEXT,
    "priority" TEXT,
    "due_date" TIMESTAMPTZ,
    "category" TEXT,
    "status" TEXT,
    "user_id" TEXT,
    "created_date" TEXT,
    "assigned_to" TEXT,
    "is_completed" BOOLEAN DEFAULT false,
    "created_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."todos" ENABLE ROW LEVEL SECURITY;

-- Collection: trip_calculations
CREATE TABLE IF NOT EXISTS public."trip_calculations" (
    id TEXT PRIMARY KEY,
    "route_name" TEXT,
    "vehicle_number" TEXT,
    "distance" NUMERIC,
    "fuel_price" NUMERIC,
    "mileage" NUMERIC,
    "tolls" NUMERIC,
    "driver_expenses" NUMERIC,
    "tyre_depreciation_rate" NUMERIC,
    "tyre_expense" NUMERIC,
    "fuel_cost" NUMERIC,
    "vehicle_emi" NUMERIC,
    "insurance" NUMERIC,
    "quarterly_tax" NUMERIC,
    "freight_revenue" NUMERIC,
    "total_expenses" NUMERIC,
    "net_profit" NUMERIC,
    "profit_margin" NUMERIC,
    "user_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."trip_calculations" ENABLE ROW LEVEL SECURITY;

-- Collection: tyre_rotations
CREATE TABLE IF NOT EXISTS public."tyre_rotations" (
    id TEXT PRIMARY KEY,
    "truck_id" TEXT,
    "tyre1_id" TEXT,
    "tyre2_id" TEXT,
    "from_position1" TEXT,
    "to_position1" TEXT,
    "from_position2" TEXT,
    "to_position2" TEXT,
    "swap_odometer_reading" NUMERIC,
    "swap_date" TIMESTAMPTZ,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."tyre_rotations" ENABLE ROW LEVEL SECURITY;

-- Collection: tyres
CREATE TABLE IF NOT EXISTS public."tyres" (
    id TEXT PRIMARY KEY,
    "purchase_date" TIMESTAMPTZ,
    "tyre_brand" TEXT,
    "model_no" TEXT,
    "serial_number" TEXT,
    "tyre_depth_mm" NUMERIC,
    "truck_id" TEXT,
    "axle_position" TEXT,
    "status" TEXT,
    "tyre_position" TEXT,
    "tyre_image" TEXT,
    "bill_invoice" TEXT,
    "assignment_start_kms" NUMERIC,
    "current_lifecycle_kms" NUMERIC,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."tyres" ENABLE ROW LEVEL SECURITY;

-- Collection: user_permission_overrides
CREATE TABLE IF NOT EXISTS public."user_permission_overrides" (
    id TEXT PRIMARY KEY,
    "user_id" TEXT,
    "resource" TEXT,
    "is_allowed" BOOLEAN DEFAULT false,
    "granted_by" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."user_permission_overrides" ENABLE ROW LEVEL SECURITY;

-- Collection: user_sessions
CREATE TABLE IF NOT EXISTS public."user_sessions" (
    id TEXT PRIMARY KEY,
    "user_id" TEXT,
    "token" TEXT,
    "created_at" TEXT,
    "expires_at" TIMESTAMPTZ,
    "last_activity" TIMESTAMPTZ,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."user_sessions" ENABLE ROW LEVEL SECURITY;

-- Collection: users
CREATE TABLE IF NOT EXISTS public."users" (
    id TEXT PRIMARY KEY,
    "password" TEXT,
    "tokenKey" TEXT,
    "email" TEXT,
    "emailVisibility" BOOLEAN DEFAULT false,
    "verified" BOOLEAN DEFAULT false,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT,
    "full_name" TEXT,
    "phone_number" TEXT,
    "status" TEXT,
    "profile_picture" TEXT,
    "last_login" TIMESTAMPTZ,
    "created_date" TEXT,
    "client_id" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;

-- Collection: vehicles
CREATE TABLE IF NOT EXISTS public."vehicles" (
    id TEXT PRIMARY KEY,
    "vehicle_name" TEXT,
    "registration_number" TEXT,
    "vehicle_type" TEXT,
    "make" TEXT,
    "model" TEXT,
    "year" NUMERIC,
    "capacity" NUMERIC,
    "fuel_type" TEXT,
    "purchase_date" TIMESTAMPTZ,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."vehicles" ENABLE ROW LEVEL SECURITY;

-- Collection: vendor_empanelments
CREATE TABLE IF NOT EXISTS public."vendor_empanelments" (
    id TEXT PRIMARY KEY,
    "company_name" TEXT,
    "assigned_vendor_id" TEXT,
    "application_ref_no" TEXT,
    "category" TEXT,
    "applied_date" TEXT,
    "stage" TEXT,
    "procurement_officer" TEXT,
    "officer_phone" TEXT,
    "officer_email" TEXT,
    "portal_url" TEXT,
    "allocated_fleet" TEXT,
    "status" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."vendor_empanelments" ENABLE ROW LEVEL SECURITY;

-- Collection: vendors
CREATE TABLE IF NOT EXISTS public."vendors" (
    id TEXT PRIMARY KEY,
    "company_name" TEXT,
    "vendor_type" TEXT,
    "contact_person" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "bank_name" TEXT,
    "account_number" TEXT,
    "ifsc_code" TEXT,
    "city" TEXT,
    "payment_terms" TEXT,
    "status" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."vendors" ENABLE ROW LEVEL SECURITY;

-- Collection: workshop_job_cards
CREATE TABLE IF NOT EXISTS public."workshop_job_cards" (
    id TEXT PRIMARY KEY,
    "job_card_number" TEXT,
    "truck_number" TEXT,
    "driver_name" TEXT,
    "odometer_reading" NUMERIC,
    "service_type" TEXT,
    "assigned_mechanic" TEXT,
    "supervisor_name" TEXT,
    "status" TEXT,
    "parts_cost" NUMERIC,
    "labour_cost" NUMERIC,
    "tax_amount" NUMERIC,
    "total_cost" NUMERIC,
    "complaints_list" TEXT,
    "notes" TEXT,
    "entry_date" TIMESTAMPTZ,
    "completion_date" TIMESTAMPTZ,
    "itemized_items" JSONB,
    "bill" TEXT,
    "bill_url" TEXT,
    "service_log_id" TEXT,
    "expense_id" TEXT,
    "cashbook_id" TEXT,
    "maintenance_log_id" TEXT,
    "bills_json" JSONB,
    "bills" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."workshop_job_cards" ENABLE ROW LEVEL SECURITY;

-- Collection: workshop_parts_inventory
CREATE TABLE IF NOT EXISTS public."workshop_parts_inventory" (
    id TEXT PRIMARY KEY,
    "part_number" TEXT,
    "part_name" TEXT,
    "category" TEXT,
    "unit" TEXT,
    "current_stock" NUMERIC,
    "min_stock_level" NUMERIC,
    "unit_price" NUMERIC,
    "supplier_name" TEXT,
    "location_rack" TEXT,
    "notes" TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);
ALTER TABLE public."workshop_parts_inventory" ENABLE ROW LEVEL SECURITY;

