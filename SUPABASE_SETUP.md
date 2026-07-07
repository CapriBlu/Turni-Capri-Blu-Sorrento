# Supabase Setup — App Turni Capri Blu

Questo documento copre la Fase 4: creazione del backend Supabase.

---

## Obiettivo

Creare un database centrale per sostituire:

- localStorage;
- backup manuali come fonte dati principale;
- salvataggio ufficiale JSON su GitHub.

GitHub resterà per codice, documentazione e versioni.

---

## Cosa serve dal proprietario

Questa è una delle poche fasi dove serve intervento umano.

Serviranno:

1. account Supabase;
2. nome progetto;
3. regione progetto;
4. password database;
5. email admin iniziale;
6. eventuale dominio futuro.

Senza questi dati possiamo preparare tutto, ma non creare davvero il progetto online.

---

## Nome progetto consigliato

```txt
capri-blu-turni
```

Organizzazione:

```txt
Capri Blu Sorrento
```

Regione consigliata:

```txt
Europe West / EU
```

---

## Variabili ambiente previste

Nel frontend serviranno:

```txt
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Mai mettere nel frontend:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

La service role key va usata solo lato server o in script protetti.

---

## Setup database

Passi:

1. creare progetto Supabase;
2. aprire SQL Editor;
3. creare schema tabelle da `DATABASE_SCHEMA.md`;
4. creare seed iniziale;
5. attivare Row Level Security;
6. creare policy per ruoli;
7. testare login admin;
8. testare lettura/scrittura turni.

---

## Seed iniziale

### Organizzazione

```txt
Capri Blu Sorrento
capri-blu-sorrento
```

### Reparti

```txt
Sala
Pizzeria
Cucina / Lavaggio
```

### Staff iniziale

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

## Policy RLS previste

### Admin

Può leggere e scrivere tutto nella propria organizzazione.

### Manager

Può gestire turni, richieste, pubblicazioni e archivio.

### Employee

Può leggere solo turni pubblicati e creare richieste proprie.

### Viewer

Può leggere solo contenuto pubblicato.

---

## Tabelle minime per partire

Per la prima versione servono solo:

```txt
organizations
user_profiles
departments
employees
weeks
shifts
requests
```

Poi aggiungiamo:

```txt
published_weeks
monthly_presence
audit_logs
```

---

## Controlli sicurezza

- RLS attiva su tutte le tabelle;
- nessuna service key nel browser;
- ruoli gestiti da `user_profiles`;
- backup database attivo;
- export JSON disponibile dall'app.

---

## Test minimo backend

1. Login admin.
2. Creare settimana.
3. Creare turno Sala.
4. Creare turno Pizzeria.
5. Creare richiesta.
6. Leggere dati dopo refresh.
7. Verificare che collaboratore non possa modificare turni.

---

## Output finale Fase 4

La Fase 4 è completa quando abbiamo:

- progetto Supabase creato;
- schema applicato;
- seed iniziale inserito;
- admin funzionante;
- policy base attive;
- variabili ambiente pronte.
