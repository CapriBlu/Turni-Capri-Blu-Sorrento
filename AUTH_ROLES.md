# Auth Roles — App Turni Capri Blu

Questo documento copre la Fase 5: ruoli e permessi della futura app.

---

## Obiettivo

Definire chi può vedere e modificare le varie parti dell'app.

---

## Ruoli previsti

### Admin

Responsabile completo del sistema.

Può:

- gestire utenti;
- gestire staff;
- gestire reparti;
- creare e modificare turni;
- pubblicare settimane;
- vedere archivio;
- esportare backup;
- vedere log modifiche.

### Manager

Responsabile operativo dei turni.

Può:

- creare e modificare turni;
- gestire richieste;
- pubblicare settimane;
- vedere presenze e archivio;
- esportare dati operativi.

Non dovrebbe gestire impostazioni tecniche o ruoli admin.

### Employee

Collaboratore del ristorante.

Può:

- vedere i turni pubblicati;
- vedere i propri turni;
- inviare richieste;
- vedere lo stato delle proprie richieste.

Non può modificare turni o dati di altri.

### Viewer

Accesso solo lettura.

Può:

- vedere la settimana pubblicata;
- non modificare nulla.

---

## Schermata iniziale per ruolo

```txt
admin   -> Dashboard
manager -> Dashboard
employee -> I miei turni
viewer  -> Settimana pubblicata
```

---

## Matrice permessi

| Funzione | Admin | Manager | Employee | Viewer |
|---|---|---|---|---|
| Vede dashboard | Sì | Sì | No | No |
| Modifica turni | Sì | Sì | No | No |
| Pubblica settimana | Sì | Sì | No | No |
| Gestisce richieste | Sì | Sì | Solo proprie | No |
| Vede turni pubblicati | Sì | Sì | Sì | Sì |
| Gestisce staff | Sì | Limitato | No | No |
| Esporta dati | Sì | Sì | No | No |
| Vede log | Sì | Limitato | No | No |

---

## Regole importanti

- Ogni utente appartiene a una organizzazione.
- Ogni dato deve essere filtrato per organizzazione.
- I collaboratori non vedono bozze non pubblicate.
- I collaboratori creano richieste solo per sé stessi.
- Viewer non scrive mai.
- Le modifiche importanti devono generare log.

---

## Intervento richiesto più avanti

Quando passeremo dalla progettazione alla configurazione reale servirà scegliere:

- primo utente admin;
- eventuali manager;
- collaboratori con accesso personale;
- modalità del link sola lettura.

---

## Output finale Fase 5

La fase è completa quando:

- ruoli creati;
- permessi applicati;
- schermata iniziale cambia in base al ruolo;
- collaboratore non può modificare i turni;
- viewer resta in sola lettura.
