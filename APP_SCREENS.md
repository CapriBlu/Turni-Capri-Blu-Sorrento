# App Screens — Turni Capri Blu Sorrento

Questo documento definisce le schermate principali della futura app gestionale.

Obiettivo: progettare prima l'esperienza mobile, poi sviluppare.

---

## Principio UI

L'app deve essere prima mobile, poi desktop.

Regole:

- pochi pulsanti visibili;
- tabella compatta;
- sezioni apribili/chiudibili;
- salvataggio chiaro;
- niente funzioni nascoste importanti;
- ogni schermata deve avere un'azione principale.

---

## 1. Login

### Scopo

Far accedere admin, manager e collaboratori.

### Elementi

- logo Capri Blu;
- email;
- password o magic link;
- pulsante Accedi;
- eventuale recupero password.

### Dopo login

- admin/manager vanno alla Dashboard;
- collaboratore va alla Settimana pubblicata / I miei turni.

---

## 2. Dashboard

### Scopo

Dare accesso rapido alle funzioni principali.

### Card principali

- Turni settimana;
- Richieste staff;
- Presenze mensili;
- Archivio;
- Staff e reparti;
- Impostazioni.

### Indicatori utili

- settimana corrente;
- stato bozza/pubblicata;
- richieste in attesa;
- ultimo salvataggio;
- ultimo invio al mensile.

---

## 3. Turni settimana

### Scopo

Sostituire la tabella attuale.

### Struttura

- selettore settimana;
- stato: Bozza / Pubblicata / Archiviata;
- sezioni:
  - Sala;
  - Pizzeria;
  - Cucina / Lavaggio;
- pulsanti:
  - Copia settimana precedente;
  - Invia al mensile;
  - Pubblica;
  - Esporta.

### Mobile

Su telefono:

- sezioni chiuse/apribili;
- nomi staff sempre visibili;
- giorni scrollabili orizzontalmente;
- tap su cella per modificare.

---

## 4. Editor turno

### Scopo

Modificare velocemente un turno.

### Sala

Due slot:

- Pranzo / Apertura;
- Sera / Cena.

Valori rapidi:

- R;
- A;
- P;
- S;
- C;
- orari rapidi 9, 10, 12, 15:30, 16, 17, 19.

### Pizzeria / Cucina

Valori rapidi:

- R;
- M;
- S;
- M/S;
- 12/chius.

### Azioni

- Salva;
- Annulla;
- Tutto riposo;
- Nota turno.

---

## 5. Richieste staff

### Scopo

Gestire ferie, riposo, permessi.

### Admin/Manager vede

- lista richieste;
- filtro per stato;
- filtro per dipendente;
- approva;
- rifiuta;
- nota manager.

### Collaboratore vede

- invia richiesta;
- mie richieste;
- stato richiesta.

### Stati

- In attesa;
- Approvata;
- Rifiutata;
- Annullata.

---

## 6. Pubblicazione mensile

### Scopo

Sostituire il pulsante attuale `Invia al mensile`.

### Elementi

- riepilogo settimana;
- controllo errori;
- conferma pubblicazione;
- creazione snapshot;
- generazione presenze mensili.

### Regola

Dopo pubblicazione, la versione pubblicata deve restare consultabile anche se la bozza cambia.

---

## 7. Presenze mensili

### Scopo

Vedere il mese per reparto e dipendente.

### Filtri

- mese;
- reparto;
- dipendente;
- solo presenti;
- solo assenti/riposo.

### Azioni

- esporta PDF;
- esporta Excel/CSV;
- stampa;
- apri settimana origine.

---

## 8. Archivio storico

### Scopo

Consultare settimane e mesi passati.

### Vista settimana

- settimana pubblicata;
- reparto;
- snapshot;
- chi ha pubblicato;
- data pubblicazione.

### Vista mese

- riepilogo presenze;
- esportazione;
- ricerca dipendente.

---

## 9. Staff e reparti

### Scopo

Gestire persone e reparti.

### Reparti iniziali

- Sala;
- Pizzeria;
- Cucina / Lavaggio.

### Azioni

- aggiungi dipendente;
- disattiva dipendente;
- cambia reparto;
- cambia ordine visualizzazione;
- collega dipendente a login utente.

---

## 10. Impostazioni / Backup

### Scopo

Gestire configurazioni e sicurezza.

### Elementi

- dati ristorante;
- ruoli utenti;
- esporta backup JSON;
- importa backup JSON;
- log modifiche;
- informazioni versione app;
- stato PWA/installazione.

---

## Navigazione consigliata

### Admin / Manager

```txt
Dashboard
├── Turni settimana
├── Richieste
├── Presenze mensili
├── Archivio
├── Staff/Reparti
└── Impostazioni
```

### Collaboratore

```txt
I miei turni
├── Settimana pubblicata
├── Le mie richieste
└── Nuova richiesta
```

---

## Prossimo passo

Dopo questo documento, creare `SUPABASE_SETUP.md` per descrivere la configurazione backend.
