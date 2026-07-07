# Next Steps Operativi — App Turni Capri Blu

Questo documento trasforma la roadmap in passi pratici da seguire.

Obiettivo: passare dalla progettazione alla costruzione reale della nuova app senza rompere il sito GitHub attuale.

---

## Regola principale

Il sito attuale resta stabile e funzionante.

La nuova app va costruita a parte, usando il sito attuale come riferimento funzionale e come backup.

---

## Decisione tecnica confermata

Stack consigliato:

```txt
PWA + Supabase + GitHub
```

- PWA = app installabile da telefono/tablet/computer;
- Supabase = database, utenti, ruoli, sicurezza;
- GitHub = codice, documentazione, storico modifiche.

---

## Prossimo blocco operativo

### Blocco A — Preparazione Supabase

Questo è il primo vero passo operativo.

#### Serve intervento del proprietario

Bisogna creare o usare un account Supabase.

Dati da decidere:

```txt
Nome progetto: capri-blu-turni
Regione: Europa / EU
Organizzazione: Capri Blu Sorrento
Primo ruolo: Admin
```

#### Output atteso

Alla fine del blocco A dobbiamo avere:

- progetto Supabase creato;
- URL progetto;
- anon key per frontend;
- database pronto a ricevere schema;
- primo utente admin definito.

---

## Blocco B — Tradurre schema in SQL

Partendo da `DATABASE_SCHEMA.md`, creare file SQL reali.

### File da creare

```txt
supabase/schema.sql
supabase/seed.sql
supabase/policies.sql
```

### Contenuto

#### `schema.sql`

Crea tabelle:

- organizations;
- user_profiles;
- departments;
- employees;
- weeks;
- shifts;
- requests;
- published_weeks;
- monthly_presence;
- audit_logs.

#### `seed.sql`

Inserisce:

- Capri Blu Sorrento;
- Sala;
- Pizzeria;
- Cucina / Lavaggio;
- staff iniziale.

#### `policies.sql`

Prepara:

- permessi Admin;
- permessi Manager;
- permessi Employee;
- permessi Viewer.

---

## Blocco C — Creare cartella app nuova

Non modificare subito il sito attuale.

Creare una nuova cartella:

```txt
app/
```

Struttura consigliata:

```txt
app/
├── index.html
├── package.json
├── src/
│   ├── main.js
│   ├── config/
│   ├── lib/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── styles/
└── public/
    ├── manifest.webmanifest
    └── icons/
```

Il sito attuale resta nella root.

---

## Blocco D — Login e permessi

Prima funzione reale da sviluppare nella nuova app.

### Pagine

```txt
Login
Dashboard
Accesso negato
```

### Ruoli

- Admin;
- Manager;
- Employee;
- Viewer.

### Test minimo

1. Admin entra e vede dashboard.
2. Manager entra e vede dashboard operativa.
3. Employee vede solo i propri turni/pubblicati.
4. Viewer vede solo pubblicato.

---

## Blocco E — Turni settimanali da database

Seconda funzione reale.

### Obiettivo

Ricreare la tabella turni usando Supabase.

### Funzioni minime

- selezione settimana;
- creazione settimana se non esiste;
- visualizzazione Sala/Pizzeria/Cucina;
- modifica turno;
- salvataggio database;
- refresh senza perdere dati.

### Test minimo

1. modificare Sala;
2. modificare Pizzeria;
3. modificare Cucina;
4. ricaricare pagina;
5. dati ancora presenti.

---

## Blocco F — Richieste staff

Portare le richieste nel database.

### Funzioni minime

- crea richiesta;
- lista richieste;
- approva/rifiuta;
- richiesta appare nella tabella.

### Permessi

- Employee crea solo le proprie richieste;
- Manager/Admin gestisce tutte;
- Viewer non vede dati privati.

---

## Blocco G — Pubblicazione settimana

Sostituire `Invia al mensile`.

### Funzioni minime

- riepilogo settimana;
- conferma pubblicazione;
- snapshot in `published_weeks`;
- generazione `monthly_presence`;
- versione pubblicata visibile ai collaboratori.

---

## Blocco H — Archivio storico

Costruire archivio consultabile.

### Funzioni minime

- cerca settimana;
- cerca mese;
- filtra reparto;
- filtra dipendente;
- esporta CSV/JSON;
- log modifiche principali.

---

## Blocco I — PWA installabile

Rendere l'app installabile.

### File

```txt
manifest.webmanifest
service-worker.js
icons/
```

### Test

- installazione su Android;
- aggiunta a Home su iPhone;
- apertura a schermo pieno;
- login funzionante;
- permessi funzionanti.

---

## Priorità immediata

La prossima azione concreta è:

```txt
1. creare progetto Supabase
2. creare cartella supabase/
3. preparare schema.sql, seed.sql, policies.sql
```

Subito dopo:

```txt
4. creare cartella app/
5. collegare Supabase
6. creare login
```

---

## Quando serve intervento del proprietario

Serve intervento umano in questi punti:

### 1. Creazione Supabase

Serve account e progetto reale.

### 2. Primo admin

Serve decidere quale email sarà admin.

### 3. Manager/collaboratori

Serve decidere chi avrà accesso e con quale ruolo.

### 4. Sola lettura

Serve decidere se il link sola lettura sarà:

- protetto con login;
- pubblico ma non modificabile;
- condiviso solo internamente.

### 5. Hosting

Serve decidere se pubblicare su:

- Vercel;
- Netlify;
- Supabase Hosting;
- GitHub Pages solo per vecchio sito.

---

## Checklist immediata

Prima sessione operativa:

- [ ] confermare Supabase;
- [ ] creare progetto `capri-blu-turni`;
- [ ] scegliere email Admin;
- [ ] creare `supabase/schema.sql`;
- [ ] creare `supabase/seed.sql`;
- [ ] creare `supabase/policies.sql`;
- [ ] applicare SQL su Supabase;
- [ ] testare tabelle;
- [ ] creare cartella `app/`;
- [ ] collegare frontend a Supabase.

---

## Decisione da prendere ora

Per procedere davvero serve decidere:

```txt
Procediamo con Supabase ora?
```

Se sì, il prossimo passo è creare il progetto Supabase e poi generare i file SQL nel repository.
