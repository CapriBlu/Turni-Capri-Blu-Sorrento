-- Capri Blu Turni - Supabase schema
-- Applicare questo file nel SQL Editor di Supabase.

create extension if not exists pgcrypto;

-- =====================================================================
-- Utility
-- =====================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- Core tables
-- =====================================================================

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text,
  role text not null check (role in ('admin', 'manager', 'employee', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id),
  unique(organization_id, email)
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, slug)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  full_name text not null,
  display_name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weeks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  iso_year integer not null,
  iso_week integer not null check (iso_week >= 1 and iso_week <= 53),
  week_code text not null,
  monday_date date not null,
  sunday_date date not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, week_code)
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  week_id uuid not null references public.weeks(id) on delete cascade,
  department_id uuid not null references public.departments(id),
  employee_id uuid not null references public.employees(id),
  shift_date date not null,
  day_key text not null check (day_key in ('lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica')),
  lunch_value text not null default 'Riposo',
  dinner_value text not null default 'Riposo',
  kitchen_value text,
  note text,
  is_published_snapshot boolean not null default false,
  created_by uuid references public.user_profiles(id) on delete set null,
  updated_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, employee_id, shift_date, is_published_snapshot)
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  request_date date not null,
  request_type text not null check (request_type in ('Ferie', 'Riposo', 'Permesso', 'Altro')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  note text,
  manager_note text,
  created_by uuid references public.user_profiles(id) on delete set null,
  reviewed_by uuid references public.user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.published_weeks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  week_id uuid not null references public.weeks(id) on delete cascade,
  published_by uuid references public.user_profiles(id) on delete set null,
  published_at timestamptz not null default now(),
  version integer not null default 1,
  status text not null default 'published' check (status in ('published', 'superseded', 'archived')),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_presence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id),
  department_id uuid not null references public.departments(id),
  year integer not null,
  month integer not null check (month >= 1 and month <= 12),
  presence_date date not null,
  source_week_id uuid references public.weeks(id) on delete set null,
  shift_summary text,
  is_present boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, employee_id, presence_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Updated-at triggers
-- =====================================================================

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

drop trigger if exists employees_set_updated_at on public.employees;
create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

drop trigger if exists weeks_set_updated_at on public.weeks;
create trigger weeks_set_updated_at
before update on public.weeks
for each row execute function public.set_updated_at();

drop trigger if exists shifts_set_updated_at on public.shifts;
create trigger shifts_set_updated_at
before update on public.shifts
for each row execute function public.set_updated_at();

drop trigger if exists requests_set_updated_at on public.requests;
create trigger requests_set_updated_at
before update on public.requests
for each row execute function public.set_updated_at();

drop trigger if exists monthly_presence_set_updated_at on public.monthly_presence;
create trigger monthly_presence_set_updated_at
before update on public.monthly_presence
for each row execute function public.set_updated_at();

-- =====================================================================
-- Indexes
-- =====================================================================

create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
create index if not exists user_profiles_organization_id_idx on public.user_profiles(organization_id);

create index if not exists departments_organization_id_idx on public.departments(organization_id);

create index if not exists employees_organization_id_idx on public.employees(organization_id);
create index if not exists employees_department_id_idx on public.employees(department_id);
create index if not exists employees_active_idx on public.employees(is_active);

create index if not exists weeks_organization_id_idx on public.weeks(organization_id);
create index if not exists weeks_code_idx on public.weeks(week_code);

create index if not exists shifts_week_id_idx on public.shifts(week_id);
create index if not exists shifts_employee_id_idx on public.shifts(employee_id);
create index if not exists shifts_department_id_idx on public.shifts(department_id);
create index if not exists shifts_date_idx on public.shifts(shift_date);

create index if not exists requests_employee_id_idx on public.requests(employee_id);
create index if not exists requests_date_idx on public.requests(request_date);
create index if not exists requests_status_idx on public.requests(status);

create index if not exists published_weeks_week_id_idx on public.published_weeks(week_id);
create index if not exists monthly_presence_employee_month_idx on public.monthly_presence(employee_id, year, month);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
