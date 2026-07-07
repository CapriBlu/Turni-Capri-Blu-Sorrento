-- Capri Blu Turni - Row Level Security policies
-- Applicare dopo supabase/schema.sql e supabase/seed.sql

-- =====================================================================
-- Helper functions
-- =====================================================================

create or replace function public.current_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id
  from public.user_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id
  from public.user_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.user_profiles
  where user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_role() = any(allowed_roles), false);
$$;

create or replace function public.same_organization(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_organization_id() = target_organization_id;
$$;

-- =====================================================================
-- Enable RLS
-- =====================================================================

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.weeks enable row level security;
alter table public.shifts enable row level security;
alter table public.requests enable row level security;
alter table public.published_weeks enable row level security;
alter table public.monthly_presence enable row level security;
alter table public.audit_logs enable row level security;

-- =====================================================================
-- Organizations
-- =====================================================================

drop policy if exists organizations_read_own on public.organizations;
create policy organizations_read_own
on public.organizations
for select
to authenticated
using (id = public.current_organization_id());

drop policy if exists organizations_admin_update_own on public.organizations;
create policy organizations_admin_update_own
on public.organizations
for update
to authenticated
using (id = public.current_organization_id() and public.has_role(array['admin']))
with check (id = public.current_organization_id() and public.has_role(array['admin']));

-- =====================================================================
-- User profiles
-- =====================================================================

drop policy if exists user_profiles_read_own_org on public.user_profiles;
create policy user_profiles_read_own_org
on public.user_profiles
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    user_id = auth.uid()
    or public.has_role(array['admin', 'manager'])
  )
);

drop policy if exists user_profiles_admin_write on public.user_profiles;
create policy user_profiles_admin_write
on public.user_profiles
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin']));

-- =====================================================================
-- Departments
-- =====================================================================

drop policy if exists departments_read_own_org on public.departments;
create policy departments_read_own_org
on public.departments
for select
to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists departments_admin_manager_write on public.departments;
create policy departments_admin_manager_write
on public.departments
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Employees
-- =====================================================================

drop policy if exists employees_read_own_org on public.employees;
create policy employees_read_own_org
on public.employees
for select
to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists employees_admin_manager_write on public.employees;
create policy employees_admin_manager_write
on public.employees
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Weeks
-- =====================================================================

drop policy if exists weeks_read_own_org on public.weeks;
create policy weeks_read_own_org
on public.weeks
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    public.has_role(array['admin', 'manager'])
    or status in ('published', 'archived')
  )
);

drop policy if exists weeks_admin_manager_write on public.weeks;
create policy weeks_admin_manager_write
on public.weeks
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Shifts
-- =====================================================================

drop policy if exists shifts_read_by_role on public.shifts;
create policy shifts_read_by_role
on public.shifts
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    public.has_role(array['admin', 'manager'])
    or is_published_snapshot = true
    or exists (
      select 1
      from public.weeks w
      where w.id = shifts.week_id
        and w.status in ('published', 'archived')
    )
  )
);

drop policy if exists shifts_admin_manager_write on public.shifts;
create policy shifts_admin_manager_write
on public.shifts
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Requests
-- =====================================================================

drop policy if exists requests_read_by_role on public.requests;
create policy requests_read_by_role
on public.requests
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    public.has_role(array['admin', 'manager'])
    or exists (
      select 1
      from public.employees e
      join public.user_profiles up on up.id = e.user_profile_id
      where e.id = requests.employee_id
        and up.user_id = auth.uid()
    )
  )
);

drop policy if exists requests_employee_insert_own on public.requests;
create policy requests_employee_insert_own
on public.requests
for insert
to authenticated
with check (
  organization_id = public.current_organization_id()
  and (
    public.has_role(array['admin', 'manager'])
    or exists (
      select 1
      from public.employees e
      join public.user_profiles up on up.id = e.user_profile_id
      where e.id = requests.employee_id
        and up.user_id = auth.uid()
    )
  )
);

drop policy if exists requests_admin_manager_update on public.requests;
create policy requests_admin_manager_update
on public.requests
for update
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Published weeks
-- =====================================================================

drop policy if exists published_weeks_read_own_org on public.published_weeks;
create policy published_weeks_read_own_org
on public.published_weeks
for select
to authenticated
using (organization_id = public.current_organization_id());

drop policy if exists published_weeks_admin_manager_write on public.published_weeks;
create policy published_weeks_admin_manager_write
on public.published_weeks
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Monthly presence
-- =====================================================================

drop policy if exists monthly_presence_read_by_role on public.monthly_presence;
create policy monthly_presence_read_by_role
on public.monthly_presence
for select
to authenticated
using (
  organization_id = public.current_organization_id()
  and (
    public.has_role(array['admin', 'manager', 'viewer'])
    or exists (
      select 1
      from public.employees e
      join public.user_profiles up on up.id = e.user_profile_id
      where e.id = monthly_presence.employee_id
        and up.user_id = auth.uid()
    )
  )
);

drop policy if exists monthly_presence_admin_manager_write on public.monthly_presence;
create policy monthly_presence_admin_manager_write
on public.monthly_presence
for all
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']))
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

-- =====================================================================
-- Audit logs
-- =====================================================================

drop policy if exists audit_logs_admin_manager_read on public.audit_logs;
create policy audit_logs_admin_manager_read
on public.audit_logs
for select
to authenticated
using (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));

drop policy if exists audit_logs_admin_manager_insert on public.audit_logs;
create policy audit_logs_admin_manager_insert
on public.audit_logs
for insert
to authenticated
with check (organization_id = public.current_organization_id() and public.has_role(array['admin', 'manager']));
