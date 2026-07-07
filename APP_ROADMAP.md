# Roadmap App Turni Capri Blu Sorrento

Questa roadmap descrive il percorso per trasformare l'attuale sito GitHub Pages in una vera app gestionale per i turni del ristorante.

L'obiettivo non è buttare il lavoro attuale, ma usarlo come prototipo stabile da migrare gradualmente verso una PWA con database, login, ruoli, storico e backup.

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

## Fase 0 — Congelare sito attuale stabile

### Obiettivo

Mantenere l'attuale sito funzionante come versione di sicurezza.

### Stato

Completato come base iniziale.

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

Questo file: `APP_ROADMAP.md`.

### Contenuto

- obiettivo dell'app;
- ruoli utenti;
- schermate principali;
- fasi di sviluppo;
- migrazione dal sito attuale;
- rischi e regole di manutenzione.

### Stato

Avviato.

---

## Fase 2 — Schema database

### Obiettivo

Trasformare localStorage/JSON in tabelle vere.

### Output previsto

File:

```txt
DATABASE_SCHEMA.md
```

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

### Perché è fondamentale

Se il database è fatto bene, l'app resta ordinata. Se il database è confuso, anche l'app diventa difficile da mantenere.

---

## Fase 3 — Mockup schermate

### Obiettivo

Disegnare le schermate prima di svilupparle.

### Schermate minime

1. Login
2. Dashboard settimana
3. Tabella turni
4. Editor turno
5. Richieste staff
6. Pubblicazione mensile
7. Presenze mensili
8. Archivio storico
9. Staff e reparti
10. Impostazioni / backup

### Priorità mobile

L'app deve essere prima di tutto comoda da telefono.

---

## Fase 4 — Progetto Supabase

### Obiettivo

Creare il backend vero.

### Attività

- creare progetto Supabase;
- creare tabelle;
- abilitare Auth;
- configurare Row Level Security;
- creare seed iniziale reparti/staff;
- preparare ambiente sviluppo.

### Output

- progetto Supabase online;
- schema SQL versionato;
- variabili `.env` per frontend.

---

## Fase 5 — Login utenti e ruoli

### Obiettivo

Sostituire il token GitHub/browser con utenti veri.

### Ruoli minimi

#### Admin

Può fare tutto:

- gestire staff;
- modificare turni;
- pubblicare mensile;
- gestire richieste;
- vedere archivio;
- gestire utenti.

#### Manager

Può:

- modificare turni;
- gestire richieste;
- pubblicare mensile;
- vedere archivio.

#### Collaboratore

Può:

- vedere turni pubblicati;
- inviare richieste;
- vedere eventuali note personali.

#### Viewer / solo lettura

Può:

- vedere la settimana pubblicata;
- non modificare nulla.

---

## Fase 6 — Turni settimanali

### Obiettivo

Ricostruire la funzione principale dell'attuale sito dentro l'app nuova.

### Funzioni necessarie

- selezione settimana;
- Sala, Pizzeria, Cucina / Lavaggio;
- celle turno;
- spezzati;
- copia settimana precedente;
- salvataggio automatico;
- stato modifiche;
- Undo/Redo se possibile;
- storico modifiche.

### Migrazione logica

L'attuale `script.js` serve come riferimento funzionale, ma la nuova app deve leggere/scrivere dal database, non da localStorage.

---

## Fase 7 — Richieste staff

### Obiettivo

Portare richieste ferie/riposo/permessi nel database.

### Funzioni

- collaboratore invia richiesta;
- manager/admin approva o rifiuta;
- richiesta appare nella settimana corretta;
- richiesta appare nella cella turno;
- storico richieste;
- note interne.

### Stati richiesta

```txt
pending
approved
rejected
cancelled
```

---

## Fase 8 — Pubblicazione mensile

### Obiettivo

Sostituire `Invia al mensile` con una pubblicazione vera su database.

### Funzioni

- bozza settimana;
- pubblica settimana;
- blocca versione pubblicata;
- crea presenze mensili;
- aggiorna archivio;
- avvisa collaboratori.

### Regola

La settimana pubblicata deve essere stabile e consultabile anche se la bozza successiva cambia.

---

## Fase 9 — Archivio storico

### Obiettivo

Costruire uno storico consultabile senza file manuali.

### Archivio previsto

- per settimana;
- per mese;
- per reparto;
- per dipendente;
- esportazione PDF/Excel/CSV/JSON.

### Funzioni utili

- cerca dipendente;
- filtra mese;
- confronta settimane;
- totale presenze;
- note richieste;
- log modifiche.

---

## Fase 10 — PWA installabile

### Obiettivo

Rendere l'app installabile sul telefono come una app normale.

### Funzioni PWA

- icona app Capri Blu;
- schermata splash;
- manifest;
- service worker;
- cache controllata;
- funzionamento base anche con rete debole;
- aggiornamento versione sicuro.

### Nota importante

All'inizio non serve pubblicare su Play Store o App Store. Una PWA installabile basta per lavorare bene nel ristorante.

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
2. login corretto;
3. turni settimanali funzionanti;
4. pubblicazione mensile;
5. archivio storico;
6. estetica e rifiniture.

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

---

## Stato avanzamento

| Fase | Nome | Stato |
|---|---|---|
| 0 | Congelare sito attuale stabile | Completata |
| 1 | Roadmap app | Avviata |
| 2 | Schema database | Da creare |
| 3 | Mockup schermate | Da fare |
| 4 | Progetto Supabase | Da fare |
| 5 | Login utenti e ruoli | Da fare |
| 6 | Turni settimanali | Da fare |
| 7 | Richieste staff | Da fare |
| 8 | Pubblicazione mensile | Da fare |
| 9 | Archivio storico | Da fare |
| 10 | PWA installabile | Da fare |
