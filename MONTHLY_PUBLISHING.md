# Monthly Publishing — App Turni Capri Blu

Questo documento copre la Fase 8: pubblicazione della settimana e generazione presenze mensili.

---

## Obiettivo

Sostituire il pulsante attuale `Invia al mensile` con un flusso più sicuro e tracciabile.

---

## Concetto principale

La settimana può essere:

```txt
bozza -> pubblicata -> archiviata
```

La pubblicazione crea una versione stabile dei turni.

---

## Flusso pubblicazione

1. Manager/Admin apre settimana.
2. App controlla eventuali errori.
3. App mostra riepilogo.
4. Manager conferma pubblicazione.
5. App crea snapshot in `published_weeks`.
6. App genera righe in `monthly_presence`.
7. App registra log.
8. Collaboratori vedono la versione pubblicata.

---

## Controlli prima della pubblicazione

Controllare:

- settimana selezionata;
- reparti presenti;
- dipendenti attivi;
- richieste approvate;
- celle vuote o valori non validi;
- eventuali doppioni.

---

## Snapshot pubblicato

La pubblicazione deve salvare:

- dati settimana;
- reparti;
- dipendenti;
- turni;
- richieste collegate;
- utente che pubblica;
- data pubblicazione;
- numero versione.

---

## Presenze mensili

Da ogni settimana pubblicata si generano righe per il mese corrispondente.

Ogni riga contiene:

- dipendente;
- reparto;
- data;
- riepilogo turno;
- presenza sì/no;
- riferimento alla settimana origine.

---

## Versioni pubblicate

Se una settimana viene corretta dopo pubblicazione:

- creare nuova versione;
- non cancellare la precedente;
- registrare chi ha ripubblicato;
- mostrare solo l'ultima versione come attiva.

---

## Collaboratori

I collaboratori vedono solo settimane pubblicate, non bozze.

---

## Test Fase 8

La fase è completa quando:

1. si pubblica una settimana;
2. viene creato snapshot;
3. si generano presenze mensili;
4. la pagina mensile mostra i dati;
5. collaboratore vede settimana pubblicata;
6. una modifica successiva alla bozza non rompe la versione pubblicata;
7. una ripubblicazione crea nuova versione.
