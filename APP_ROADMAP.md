# Roadmap App Turni Capri Blu Sorrento

Questa roadmap descrive il percorso per trasformare l'attuale sito GitHub Pages in una vera app gestionale per i turni del ristorante.

L'obiettivo non è buttare il lavoro attuale, ma usarlo come prototipo stabile da migrare gradualmente verso una PWA con database, login, ruoli, storico, permessi e backup.

---

## Obiettivo finale

Costruire una app installabile su telefono/tablet/computer per gestire:

- turni settimanali;
- Sala, Pizzeria, Cucina / Lavaggio;
- richieste ferie, riposo, permessi;
- pubblicazione al mensile;
- presenze mensili;
- archivio storico;
- collaboratori in sola lettura;
- permessi per ruolo;
- backup e log modifiche.

Stack consigliato:

```txt
Frontend: PWA web app
Database: Supabase PostgreSQL
Auth: Supabase Auth
Hosting: Vercel / Netlify / Supabase Hosting
Repository codice: GitHub
```

GitHub resta utile per codice e documentazione, ma non deve essere il database principale dei turni.

---

## Stato di partenza

Attualmente il sito funziona così:

- frontend statico su GitHub Pages;
- dati salvati in `localStorage`;
- backup JSON;
- salvataggio ufficiale su `save/turni-attuali.json`;
- tabella unica Sala + Pizzeria + Cucina;
- richieste integrate nella tabella;
- pagina presenze mensili separata.

Questa base è utile come prototipo e come riferimento funzionale.

---

## Documenti creati

| Documento | Fase | Scopo |
|---|---:|---|
| `README.md` | 0 | Manuale sito attuale e ricostruzione |
| `APP_ROADMAP.md` | 1 | Roadmap generale app |
| `DATABASE_SCHEMA.md` | 2 | Schema database Supabase/PostgreSQL |
| `APP_SCREENS.md` | 3 | Schermate e flussi mobile |
| `SUPABASE_SETUP.md` | 4 | Piano setup backend Supabase |
| `AUTH_ROLES.md` | 5 | Ruoli e permessi |
| `WEEKLY_SHIFTS_APP.md` | 6 | Turni settimanali nella nuova app |
| `REQUESTS_WORKFLOW.md` | 7 | Workflow richieste staff |
| `MONTHLY_PUBLISHING.md` | 8 | Pubblicazione mensile e snapshot |
| `ARCHIVE_HISTORY.md` | 9 | Archivio storico, export e log |
| `PWA_INSTALLABLE.md` | 10 | PWA installabile su telefono/tablet |

---

## Fase 0 — Congelare sito attuale stabile

### Obiettivo

Mantenere l'attuale sito funzionante come versione di sicurezza.

### Stato

Completata.

### Cosa deve restare stabile

- `script.js` con render unico Sala/Pizzeria/Cucina;
- `publish-monthly.js` con invio al mensile;
- `autosave-session.js` con backup completo;
- `README.md` come manuale di ricostruzione;
- `save/turni-attuali.json` come backup ufficiale.

### Regola

Prima di iniziare l'app nuova, non rompere il sito attuale. Il sito attuale è il paracadute.

---

## Fase 1 — Roadmap app

### Obiettivo

Definire chiaramente cosa vogliamo costruire prima di scrivere codice nuovo.

### Output

`APP_ROADMAP.md`

### Stato

Completata come progettazione.

---

## Fase 2 — Schema database

### Obiettivo

Trasformare localStorage/JSON in tabelle vere.

### Output

`DATABASE_SCHEMA.md`

### Tabelle principali

- `organizations`
- `user_profiles`
- `departments`
- `employees`
- `weeks`
- `shifts`
- `requests`
- `published_weeks`
- `monthly_presence`
- `audit_logs`

### Stato

Completata come progettazione. Da trasformare in SQL quando si crea Supabase.

---

## Fase 3 — Mockup schermate

### Obiettivo

Disegnare le schermate prima di svilupparle.

### Output

`APP_SCREENS.md`

### Schermate previste

1. Login
2. Dashboard
3. Turni settimana
4. Editor turno
5. Richieste staff
6. Pubblicazione mensile
7. Presenze mensili
8. Archivio storico
9. Staff e reparti
10. Impostazioni / backup

### Stato

Completata come progettazione.

---

## Fase 4 — Progetto Supabase

### Obiettivo

Creare il backend vero.

### Output

`SUPABASE_SETUP.md`

### Stato

Progettata. Richiede intervento umano per creare il progetto Supabase reale.

### Intervento richiesto

Serviranno:

- account Supabase;
- nome progetto;
- regione;
- primo utente admin;
- variabili ambiente;
- decisione su hosting.

---

## Fase 5 — Login utenti e ruoli

### Obiettivo

Sostituire token manuali e accessi non controllati con ruoli chiari.

### Output

`AUTH_ROLES.md`

### Ruoli

- Admin;
- Manager;
- Employee;
- Viewer.

### Stato

Completata come progettazione. Da implementare con Auth e permessi database.

---

## Fase 6 — Turni settimanali

### Obiettivo

Ricostruire la funzione principale dell'attuale sito dentro l'app nuova.

### Output

`WEEKLY_SHIFTS_APP.md`

### Stato

Completata come progettazione.

---

## Fase 7 — Richieste staff

### Obiettivo

Portare richieste ferie/riposo/permessi nel database.

### Output

`REQUESTS_WORKFLOW.md`

### Stato

Completata come progettazione.

---

## Fase 8 — Pubblicazione mensile

### Obiettivo

Sostituire `Invia al mensile` con pubblicazione vera su database, snapshot e presenze mensili.

### Output

`MONTHLY_PUBLISHING.md`

### Stato

Completata come progettazione.

---

## Fase 9 — Archivio storico

### Obiettivo

Costruire uno storico consultabile senza file manuali.

### Output

`ARCHIVE_HISTORY.md`

### Stato

Completata come progettazione.

---

## Fase 10 — PWA installabile

### Obiettivo

Rendere l'app installabile sul telefono come una app normale.

### Output

`PWA_INSTALLABLE.md`

### Stato

Completata come progettazione.

---

## Migrazione dati dal sito attuale

### Origine dati attuale

- `localStorage` browser;
- `save/turni-attuali.json`;
- backup JSON scaricati manualmente.

### Strategia migrazione

1. leggere un backup JSON completo;
2. convertire `weeklyStaff` in `shifts`;
3. convertire `kitchenWeekly` in `shifts` con reparto corretto;
4. convertire `requests` in tabella `requests`;
5. convertire `monthlyPublished` e `kitchenMonthlyPublished` in settimane pubblicate;
6. validare i dati nella nuova app.

---

## Priorità reale

La priorità non è fare subito tutto.

La priorità è:

1. database corretto;
2. permessi corretti;
3. login corretto;
4. turni settimanali funzionanti;
5. pubblicazione mensile;
6. archivio storico;
7. estetica e rifiniture.

---

## Rischi principali

### 1. Rifare tutto troppo presto

Rischio: perdere stabilità.

Soluzione: mantenere GitHub Pages come versione funzionante fino a quando l'app nuova è pronta.

### 2. Database progettato male

Rischio: app difficile da modificare.

Soluzione: definire bene schema e relazioni prima di sviluppare.

### 3. Troppa grafica prima della logica

Rischio: app bella ma fragile.

Soluzione: prima dati e flussi, poi UI.

### 4. Permessi utenti confusi

Rischio: collaboratori modificano cose che non devono.

Soluzione: ruoli chiari e Row Level Security.

---

## Regole per procedere

- Fare un passo alla volta.
- Ogni fase deve produrre un file o una funzione verificabile.
- Non eliminare il sito attuale finché l'app nuova non è stabile.
- Documentare ogni decisione importante.
- Testare sempre da telefono.
- Salvare spesso su GitHub.
- Non sviluppare funzioni nuove prima di avere permessi chiari.

---

## Stato avanzamento

| Fase | Nome | Stato |
|---|---|---|
| 0 | Congelare sito attuale stabile | Completata |
| 1 | Roadmap app | Documentata |
| 2 | Schema database | Documentata |
| 3 | Mockup schermate | Documentata |
| 4 | Progetto Supabase | Documentata — richiede setup reale |
| 5 | Login utenti e ruoli | Documentata |
| 6 | Turni settimanali | Documentata |
| 7 | Richieste staff | Documentata |
| 8 | Pubblicazione mensile | Documentata |
| 9 | Archivio storico | Documentata |
| 10 | PWA installabile | Documentata |

---

## Prossimo passaggio reale

Il prossimo passo operativo non è più documentazione: è decidere se creare davvero il progetto Supabase e iniziare lo sviluppo della nuova app.

Prima decisione pratica:

```txt
Creiamo Supabase ora oppure continuiamo ancora a rifinire il sito GitHub attuale?
```
