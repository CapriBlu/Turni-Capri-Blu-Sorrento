# Database Schema — App Turni Capri Blu Sorrento

Questo documento descrive lo schema database previsto per la futura app gestionale dei turni.

Obiettivo: sostituire `localStorage` e `save/turni-attuali.json` con un database centrale, mantenendo la stessa logica funzionale dell'attuale sito.

Stack consigliato:

```txt
Supabase PostgreSQL
Supabase Auth
Row Level Security
PWA frontend
```

---

## 1. Principi di progettazione

Il database deve essere:

- semplice da capire;
- adatto a Sala, Pizzeria e Cucina;
- compatibile con storico settimane e mesi;
- sicuro per ruoli diversi;
- facile da esportare in JSON/CSV/Excel;
- abbastanza flessibile per modifiche future.

La regola principale: ogni turno deve essere una riga nel database, non un blocco JSON nascosto.

---

## 2. Tabelle principali

Schema previsto:

```txt
organizations
user_profiles
departments
employees
weeks
shifts
requests
published_weeks
monthly_presence
audit_logs
```

---

## 3. `organizations`

Serve per identificare il ristorante/azienda.

Per ora avremo una sola organizzazione: Capri Blu Sorrento.

### Campi

```txt
id uuid primary key
name text not null
slug text unique not null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Esempio

```txt
name: Capri Blu Sorrento
slug: capri-blu-sorrento
```

---

## 4. `user_profiles`

Collega gli utenti Supabase Auth ai ruoli dell'app.

### Campi

```txt
id uuid primary key
user_id uuid references auth.users(id)
organization_id uuid references organizations(id)
full_name text not null
email text
role text not null
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Ruoli previsti

```txt
admin
manager
employee
viewer
```

### Regole

- `admin` può fare tutto.
- `manager` può gestire turni e richieste.
- `employee` vede turni pubblicati e invia richieste.
- `viewer` vede solo contenuto pubblicato.

---

## 5. `departments`

Rappresenta i reparti.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
name text not null
slug text not null
sort_order integer default 0
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Seed iniziale

```txt
Sala | sala | 1
Pizzeria | pizzeria | 2
Cucina / Lavaggio | cucina | 3
```

---

## 6. `employees`

Rappresenta lo staff del ristorante.

Non tutti gli employee devono avere login. Un dipendente può essere solo una persona da mettere in tabella.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
department_id uuid references departments(id)
user_profile_id uuid references user_profiles(id) null
full_name text not null
display_name text not null
sort_order integer default 0
is_active boolean default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Esempi

Sala:

```txt
Pawel
Rafaele
Gaetano
Rosè
Shan
Brendon
Vittorio
Dylan
Lorenzo
Sabbit
Annachiara
Natalia
Carmine
```

Pizzeria:

```txt
LUCA
MARIO
IGOR
CRISTIAN
PIETRO
```

Cucina / Lavaggio:

```txt
ANTONINO
Lavapiatti
AJITH
DIEGO
Saja
```

---

## 7. `weeks`

Rappresenta una settimana di lavoro.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
iso_year integer not null
iso_week integer not null
week_code text not null
monday_date date not null
sunday_date date not null
status text default 'draft'
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Stati previsti

```txt
draft
published
archived
```

### Esempio

```txt
week_code: 2026-W28
monday_date: 2026-07-06
sunday_date: 2026-07-12
```

---

## 8. `shifts`

Questa è la tabella centrale.

Ogni riga rappresenta il turno di una persona in un giorno.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
week_id uuid references weeks(id)
department_id uuid references departments(id)
employee_id uuid references employees(id)
shift_date date not null
day_key text not null
lunch_value text default 'Riposo'
dinner_value text default 'Riposo'
kitchen_value text null
note text null
is_published_snapshot boolean default false
created_by uuid references user_profiles(id) null
updated_by uuid references user_profiles(id) null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Perché `lunch_value`, `dinner_value` e `kitchen_value`

Sala usa due slot:

```txt
lunch_value
dinner_value
```

Pizzeria/Cucina oggi usano un valore unico:

```txt
kitchen_value
```

In futuro si potrà uniformare tutto a slot multipli, ma per partire questa struttura rispecchia bene il sito attuale.

### Valori tipici Sala

```txt
Riposo
Apertura
Pranzo
Sera
Cena
9
10
12
15:30
16
17
19
```

### Valori tipici Pizzeria/Cucina

```txt
Riposo
M
S
M/S
12/chius
```

---

## 9. `requests`

Richieste ferie/riposo/permesso.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
employee_id uuid references employees(id)
request_date date not null
request_type text not null
status text default 'pending'
note text null
manager_note text null
created_by uuid references user_profiles(id) null
reviewed_by uuid references user_profiles(id) null
reviewed_at timestamptz null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Tipi richiesta

```txt
Ferie
Riposo
Permesso
Altro
```

### Stati

```txt
pending
approved
rejected
cancelled
```

### Regola visuale

Una richiesta approvata deve comparire nella cella turno corrispondente.

---

## 10. `published_weeks`

Rappresenta una settimana pubblicata.

Serve per bloccare una versione stabile dei turni, anche se la bozza cambia dopo.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
week_id uuid references weeks(id)
published_by uuid references user_profiles(id)
published_at timestamptz default now()
version integer default 1
status text default 'published'
snapshot jsonb not null
created_at timestamptz default now()
```

### Perché `snapshot jsonb`

Anche se i turni stanno in `shifts`, lo snapshot JSON permette di conservare esattamente la versione pubblicata, utile per archivio e sicurezza.

---

## 11. `monthly_presence`

Riepilogo mensile presenze.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
employee_id uuid references employees(id)
department_id uuid references departments(id)
year integer not null
month integer not null
presence_date date not null
source_week_id uuid references weeks(id)
shift_summary text null
is_present boolean default false
note text null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### Uso

Questa tabella può essere generata dalla settimana pubblicata.

Serve per:

- archivio mensile;
- conteggi presenze;
- esportazione;
- controllo storico.

---

## 12. `audit_logs`

Log modifiche.

Serve per sapere chi ha cambiato cosa.

### Campi

```txt
id uuid primary key
organization_id uuid references organizations(id)
user_profile_id uuid references user_profiles(id) null
action text not null
entity_type text not null
entity_id uuid null
before_data jsonb null
after_data jsonb null
created_at timestamptz default now()
```

### Esempi action

```txt
create_shift
update_shift
delete_shift
publish_week
create_request
approve_request
reject_request
restore_backup
```

---

## 13. Mappatura dal sito attuale

### localStorage attuale → database nuovo

```txt
capriBluTurniStaffWeekV1-<week>          -> shifts per reparto Sala
capriBluTurniCucinaWeekV1-<week>         -> shifts per Pizzeria/Cucina
capriBluRichiesteStaffV1                 -> requests
capriBluTurniStaffPublishedWeekV1-<week> -> published_weeks + monthly_presence
capriBluTurniCucinaPublishedWeekV1-<week> -> published_weeks + monthly_presence
```

### Backup JSON attuale

Il backup JSON contiene:

```txt
weeklyStaff
monthlyPublished
kitchenWeekly
kitchenMonthlyPublished
requests
currentWeek
lastPublishedWeek
```

Questi dati possono essere migrati nel database.

---

## 14. Relazioni principali

```txt
organizations 1 -> many departments
organizations 1 -> many employees
organizations 1 -> many weeks
organizations 1 -> many shifts
organizations 1 -> many requests
organizations 1 -> many published_weeks

departments 1 -> many employees
departments 1 -> many shifts

employees 1 -> many shifts
employees 1 -> many requests
employees 1 -> many monthly_presence

weeks 1 -> many shifts
weeks 1 -> many published_weeks
weeks 1 -> many monthly_presence
```

---

## 15. Row Level Security — regole base

### Admin

Può leggere e scrivere tutto nella propria organizzazione.

### Manager

Può:

- leggere tutto nella propria organizzazione;
- creare/modificare turni;
- gestire richieste;
- pubblicare settimane.

### Employee

Può:

- leggere settimane pubblicate;
- leggere i propri dati;
- creare richieste proprie;
- modificare o cancellare richieste proprie solo se ancora pending.

### Viewer

Può:

- leggere solo settimane pubblicate;
- non può modificare nulla.

---

## 16. Indici consigliati

```sql
create index shifts_week_id_idx on shifts(week_id);
create index shifts_employee_id_idx on shifts(employee_id);
create index shifts_department_id_idx on shifts(department_id);
create index shifts_date_idx on shifts(shift_date);

create index requests_employee_id_idx on requests(employee_id);
create index requests_date_idx on requests(request_date);
create index requests_status_idx on requests(status);

create index monthly_presence_employee_month_idx on monthly_presence(employee_id, year, month);
```

---

## 17. Vincoli consigliati

### `weeks`

Una settimana per organizzazione:

```sql
unique(organization_id, week_code)
```

### `departments`

Uno slug reparto per organizzazione:

```sql
unique(organization_id, slug)
```

### `employees`

Non mettere un vincolo rigido sul nome, perché due persone potrebbero avere nomi simili.

### `shifts`

Un turno per dipendente per giorno:

```sql
unique(organization_id, employee_id, shift_date, is_published_snapshot)
```

Questa regola va valutata bene quando useremo snapshot pubblicati.

---

## 18. Migrazione iniziale consigliata

1. Esportare JSON attuale dal sito.
2. Creare organizzazione Capri Blu Sorrento.
3. Creare reparti.
4. Creare employees.
5. Creare weeks dai codici `YYYY-Www`.
6. Convertire Sala da `weeklyStaff` a `shifts`.
7. Convertire Pizzeria/Cucina da `kitchenWeekly` a `shifts`.
8. Convertire `requests`.
9. Convertire pubblicazioni mensili.
10. Verificare con confronto visivo app vs sito attuale.

---

## 19. Prima versione minima del database

Per partire davvero non servono tutte le tabelle subito.

Versione minima:

```txt
organizations
departments
employees
weeks
shifts
requests
user_profiles
```

Dopo si aggiungono:

```txt
published_weeks
monthly_presence
audit_logs
```

---

## 20. Note di manutenzione

- Non salvare turni solo in JSON se siamo già in database.
- Non duplicare la logica Sala/Pizzeria/Cucina in tre sistemi separati.
- Usare sempre `department_id` per distinguere i reparti.
- Tenere `published_weeks` separato dalle bozze.
- Tenere `audit_logs` semplice ma utile.
- Documentare ogni modifica dello schema.

---

## 21. Prossimo passo dopo questo file

Dopo aver confermato questo schema, il passo successivo è creare:

```txt
APP_SCREENS.md
```

con mockup testuali delle schermate principali.
