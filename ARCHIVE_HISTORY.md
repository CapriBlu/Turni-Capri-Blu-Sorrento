# Archive History — App Turni Capri Blu

Questo documento copre la Fase 9: archivio storico della futura app.

---

## Obiettivo

Creare uno storico ordinato di settimane, mesi, presenze, pubblicazioni e modifiche.

L'archivio deve sostituire cartelle manuali e file sparsi.

---

## Cosa deve contenere l'archivio

### Archivio settimane

Per ogni settimana:

- codice settimana;
- stato;
- reparti;
- turni pubblicati;
- richieste collegate;
- data pubblicazione;
- utente che ha pubblicato;
- versione pubblicata.

### Archivio mesi

Per ogni mese:

- presenze per dipendente;
- presenze per reparto;
- riepilogo turni;
- esportazioni;
- note.

### Archivio modifiche

Per ogni modifica importante:

- chi ha modificato;
- cosa ha modificato;
- quando;
- valore prima;
- valore dopo.

---

## Permessi archivio

### Admin

Vede tutto e può esportare tutto.

### Manager

Vede archivio operativo, presenze e settimane pubblicate.

### Employee

Vede solo i propri turni pubblicati e le proprie richieste.

### Viewer

Vede solo contenuti pubblicati in sola lettura, se abilitato.

---

## Filtri archivio

Filtri principali:

- anno;
- mese;
- settimana;
- reparto;
- dipendente;
- stato pubblicazione;
- tipo richiesta;
- utente che ha modificato.

---

## Esportazioni

Formati previsti:

```txt
PDF
Excel
CSV
JSON
```

### PDF

Per stampa o condivisione rapida.

### Excel / CSV

Per contabilità, conteggi, analisi.

### JSON

Per backup tecnico e migrazione.

---

## Vista settimana archiviata

Deve mostrare:

- tabella turni pubblicata;
- reparti;
- richieste approvate;
- note;
- versione;
- data pubblicazione;
- pulsante esporta.

---

## Vista mese archiviato

Deve mostrare:

- calendario mese;
- lista dipendenti;
- presenze;
- riepiloghi;
- esportazione.

---

## Log modifiche

Il log deve essere semplice ma utile.

Azioni da registrare:

```txt
create_shift
update_shift
delete_shift
publish_week
republish_week
create_request
approve_request
reject_request
cancel_request
create_employee
update_employee
deactivate_employee
restore_backup
```

---

## Regola importante

Mai cancellare definitivamente dati storici importanti.

Meglio usare:

```txt
archived
inactive
cancelled
```

invece di eliminare righe.

---

## Test Fase 9

La fase è completa quando:

1. si apre una settimana passata;
2. si vede la versione pubblicata;
3. si esporta PDF;
4. si esporta CSV/Excel;
5. si filtra per dipendente;
6. si filtra per reparto;
7. si vede il log delle modifiche principali;
8. employee vede solo i propri dati.
