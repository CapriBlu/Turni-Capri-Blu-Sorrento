-- Capri Blu Turni - seed iniziale
-- Applicare dopo supabase/schema.sql

-- =====================================================================
-- Organizzazione
-- =====================================================================

insert into public.organizations (name, slug)
values ('Capri Blu Sorrento', 'capri-blu-sorrento')
on conflict (slug) do update
set name = excluded.name;

-- =====================================================================
-- Reparti
-- =====================================================================

with org as (
  select id from public.organizations where slug = 'capri-blu-sorrento'
)
insert into public.departments (organization_id, name, slug, sort_order)
select org.id, values_table.name, values_table.slug, values_table.sort_order
from org
cross join (values
  ('Sala', 'sala', 1),
  ('Pizzeria', 'pizzeria', 2),
  ('Cucina / Lavaggio', 'cucina', 3)
) as values_table(name, slug, sort_order)
on conflict (organization_id, slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = true;

-- =====================================================================
-- Staff Sala
-- =====================================================================

with org as (
  select id from public.organizations where slug = 'capri-blu-sorrento'
), dept as (
  select d.id, d.organization_id
  from public.departments d
  join org on org.id = d.organization_id
  where d.slug = 'sala'
)
insert into public.employees (organization_id, department_id, full_name, display_name, sort_order)
select dept.organization_id, dept.id, values_table.name, values_table.name, values_table.sort_order
from dept
cross join (values
  ('Pawel', 1),
  ('Rafaele', 2),
  ('Gaetano', 3),
  ('Rosè', 4),
  ('Shan', 5),
  ('Brendon', 6),
  ('Vittorio', 7),
  ('Dylan', 8),
  ('Lorenzo', 9),
  ('Sabbit', 10),
  ('Annachiara', 11),
  ('Natalia', 12),
  ('Carmine', 13)
) as values_table(name, sort_order)
where not exists (
  select 1
  from public.employees e
  where e.organization_id = dept.organization_id
    and e.department_id = dept.id
    and e.display_name = values_table.name
);

-- =====================================================================
-- Staff Pizzeria
-- =====================================================================

with org as (
  select id from public.organizations where slug = 'capri-blu-sorrento'
), dept as (
  select d.id, d.organization_id
  from public.departments d
  join org on org.id = d.organization_id
  where d.slug = 'pizzeria'
)
insert into public.employees (organization_id, department_id, full_name, display_name, sort_order)
select dept.organization_id, dept.id, values_table.name, values_table.name, values_table.sort_order
from dept
cross join (values
  ('LUCA', 1),
  ('MARIO', 2),
  ('IGOR', 3),
  ('CRISTIAN', 4),
  ('PIETRO', 5)
) as values_table(name, sort_order)
where not exists (
  select 1
  from public.employees e
  where e.organization_id = dept.organization_id
    and e.department_id = dept.id
    and e.display_name = values_table.name
);

-- =====================================================================
-- Staff Cucina / Lavaggio
-- =====================================================================

with org as (
  select id from public.organizations where slug = 'capri-blu-sorrento'
), dept as (
  select d.id, d.organization_id
  from public.departments d
  join org on org.id = d.organization_id
  where d.slug = 'cucina'
)
insert into public.employees (organization_id, department_id, full_name, display_name, sort_order)
select dept.organization_id, dept.id, values_table.name, values_table.name, values_table.sort_order
from dept
cross join (values
  ('ANTONINO', 1),
  ('Lavapiatti', 2),
  ('AJITH', 3),
  ('DIEGO', 4),
  ('Saja', 5)
) as values_table(name, sort_order)
where not exists (
  select 1
  from public.employees e
  where e.organization_id = dept.organization_id
    and e.department_id = dept.id
    and e.display_name = values_table.name
);

-- =====================================================================
-- Controllo rapido
-- =====================================================================

select
  d.name as reparto,
  count(e.id) as persone
from public.departments d
left join public.employees e on e.department_id = d.id and e.is_active = true
group by d.name, d.sort_order
order by d.sort_order;
