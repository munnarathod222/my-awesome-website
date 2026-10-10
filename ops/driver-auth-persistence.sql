-- Additive: no existing employees, passwords, trips or accounting rows are changed.
-- Run once in this website's Supabase SQL Editor before enabling DRIVER_AUTH_STORE.
begin;
create table if not exists public.jbc_driver_accounts (
  employee_id text primary key,
  employee_code text not null unique check (employee_code ~ '^[DE][0-9]{3,}$'),
  account jsonb not null,
  revision bigint not null default 1 check (revision >= 1),
  check (account->>'employee_id' = employee_id),
  check (account->>'employee_code' = employee_code)
);
alter table public.jbc_driver_accounts enable row level security;
revoke all on public.jbc_driver_accounts from public, anon, authenticated;
grant select, insert, update on public.jbc_driver_accounts to service_role;
commit;
