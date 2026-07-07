# Requests Workflow — App Turni Capri Blu

Questo documento copre la Fase 7: richieste staff nella nuova app.

---

## Obiettivo

Gestire richieste ferie, riposo, permessi e altro direttamente dentro l'app.

---

## Tipi richiesta

```txt
Ferie
Riposo
Permesso
Altro
```

---

## Stati richiesta

```txt
pending    -> in attesa
approved   -> approvata
rejected   -> rifiutata
cancelled  -> annullata
```

---

## Collaboratore

Può:

- creare richiesta;
- vedere le proprie richieste;
- annullare richiesta se ancora in attesa;
- vedere stato richiesta.

Campi richiesta:

```txt
data
tipo
nota
```

---

## Manager / Admin

Può:

- vedere tutte le richieste;
- filtrare per stato;
- filtrare per dipendente;
- approvare;
- rifiutare;
- aggiungere nota interna.

---

## Collegamento con tabella turni

Se una richiesta è approvata:

- compare nella cella del giorno;
- mostra indicatore visivo;
- influenza la compilazione dei turni;
- resta visibile nello storico.

Se una richiesta è pending:

- può comparire nel pannello richieste;
- opzionalmente può comparire come avviso leggero nella cella.

---

## Vista richieste

### Admin / Manager

```txt
Richieste
├── In attesa
├── Approvate
├── Rifiutate
└── Tutte
```

### Collaboratore

```txt
Le mie richieste
├── Nuova richiesta
├── In attesa
├── Approvate
└── Rifiutate
```

---

## Regole operative

- Una richiesta approvata non deve modificare automaticamente il turno senza conferma.
- Deve però essere molto visibile al manager.
- L'approvazione deve creare un log.
- Il rifiuto deve poter avere una nota.
- Le richieste cancellate restano nello storico come `cancelled`.

---

## Test Fase 7

La fase è completa quando:

1. collaboratore crea richiesta;
2. manager vede richiesta pending;
3. manager approva;
4. richiesta appare nella tabella turni;
5. manager rifiuta un'altra richiesta;
6. collaboratore vede lo stato;
7. richiesta resta nello storico.
