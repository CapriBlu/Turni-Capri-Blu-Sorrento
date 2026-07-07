# Weekly Shifts — App Turni Capri Blu

Questo documento copre la Fase 6: ricostruzione dei turni settimanali nella nuova app.

---

## Obiettivo

Ricreare la funzione principale del sito attuale dentro una app con database.

La nuova app deve mantenere ciò che funziona oggi:

- Sala;
- Pizzeria;
- Cucina / Lavaggio;
- settimana selezionabile;
- celle modificabili;
- spezzati;
- richieste visibili nelle celle;
- invio al mensile.

---

## Differenza rispetto al sito attuale

### Oggi

```txt
Tabella -> localStorage -> JSON/GitHub
```

### App nuova

```txt
Tabella -> database -> pubblicazione -> archivio
```

---

## Modello tabella

La schermata turni deve avere:

- selezione settimana;
- stato settimana;
- sezioni reparto;
- righe dipendenti;
- colonne giorni;
- cella turno;
- indicatori richiesta;
- indicatore salvataggio.

---

## Stati settimana

```txt
draft      -> bozza modificabile
published  -> pubblicata
archived   -> archiviata
```

---

## Sala

La Sala usa due slot:

```txt
Pranzo / Apertura
Sera / Cena
```

Valori tipici:

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

---

## Pizzeria e Cucina

Pizzeria/Cucina usano un valore singolo giornaliero:

```txt
Riposo
M
S
M/S
12/chius
```

In futuro si potrà uniformare tutto a slot multipli, ma la prima app deve rispettare il flusso attuale.

---

## Azioni principali

### Crea settimana

Se una settimana non esiste, l'app la crea al primo accesso.

### Modifica turno

Tap/click su cella:

- apre editor turno;
- modifica dati;
- salva nel database;
- aggiorna UI.

### Copia settimana precedente

Funzione utile per velocizzare la compilazione.

Regola:

- copia solo la bozza;
- non sovrascrive se ci sono dati senza conferma.

### Pubblica settimana

Manda la settimana verso il mensile e crea snapshot.

---

## Autosalvataggio

Ogni modifica deve essere salvata subito nel database.

UI deve mostrare:

```txt
Salvato
Salvataggio...
Errore salvataggio
```

---

## Undo / Redo

Nella prima versione può essere locale nella sessione browser.

In una versione più avanzata può usare `audit_logs`.

---

## Richieste dentro tabella

Se esiste una richiesta approvata per dipendente/giorno:

- la cella mostra indicatore;
- il colore cambia;
- il dettaglio è visibile in tap/click.

---

## Test Fase 6

La fase è completa quando:

1. si seleziona una settimana;
2. si vedono Sala/Pizzeria/Cucina;
3. si modifica un turno Sala;
4. si modifica un turno Pizzeria;
5. si modifica un turno Cucina;
6. si ricarica pagina e i dati restano;
7. si copia settimana precedente;
8. si pubblica la settimana.
