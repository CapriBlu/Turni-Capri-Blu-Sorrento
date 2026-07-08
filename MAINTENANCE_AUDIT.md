# Maintenance Audit - Turni Capri Blu

Data: 2026-07-08

## Stato generale

Il progetto è funzionante e più ordinato dopo la pulizia dei residui principali.

Valutazione aggiornata:

```txt
Stabilità: buona
Manutenibilità: buona
Rischio stratificazione: medio-basso
```

## Struttura attuale

### Admin

```txt
app/index.html
app/app.js
app/menu.js
app/local-publish.js
app/github-upload.js
app/settings.js
app/weekly-monthly.js
app/monthly.js
app/archive.js
app/theme.js
app/notifications.js
app/legacy/github-sync.js
```

### Sola lettura

```txt
app/lettura.html
app/lettura.css
app/lettura.js
```

### Dati nuovi

```txt
data/app/current-data.json
data/registry/weekly/current-week.json
data/registry/monthly/current-month.json
data/settings/admins.json
data/requests/pending-requests.json
```

### Dati vecchi mantenuti come fallback

```txt
data/current-data.json
data/settimanale/current-week.json
data/mensile/current-month.json
```

Non cancellare ancora i fallback dati.

## Pulizia fatta

### 1. `github-sync.js` spostato in legacy

Prima:

```txt
app/github-sync.js
```

Ora:

```txt
app/legacy/github-sync.js
```

Il file non viene caricato dall'app. Resta solo come rollback storico.

### 2. `local-publish.js` pulito

Rimosse funzioni doppie/fuorvianti:

```txt
saveDataToGitHub()
loadDataFromGitHub()
publishWeeklyShifts()
publishMonthlyData()
importBackupFromFile()
publishWeeklyOnline()
publishMonthlyOnline()
```

Ora `local-publish.js` mantiene solo:

```txt
dataBackupPayload()
weeklyPublishPayload()
monthlyPublishPayload()
applyDataBackup()
autosave locale
```

### 3. Upload GitHub separato

`github-upload.js` è il solo modulo che carica su GitHub.

Regola:

```txt
Token richiesto solo per singolo caricamento.
Token non salvato.
```

### 4. Menu più essenziale

`menu.js` gestisce:

```txt
navigazione
pubblicazione GitHub
backup GitHub
notifiche
settings
archivio
```

Le voci `Stampa` e `Messaggi personale` vengono ancora rimosse via JS perché restano dentro `index.html`.

## Residui rimasti

### 1. `index.html` ancora monolitico

`index.html` contiene ancora markup vecchio:

```txt
Stampa
Messaggi personale
```

Non rompe perché `menu.js` li rimuove. Però in futuro va riscritto più pulito.

### 2. `app.js` troppo grande

`app.js` contiene ancora troppe responsabilità:

```txt
turni
richieste admin
approvazione/rifiuto richieste
email conferma
indicatori calendario
```

Da separare in futuro:

```txt
app/schedule-core.js
app/requests-admin.js
```

### 3. `lettura.js` troppo grande

`lettura.js` contiene:

```txt
render turni sola lettura
reparti a tendina
richieste staff
email capo reparto
settings admin reparto
```

Da separare in futuro:

```txt
app/read-schedule.js
app/read-requests.js
```

## Regole di manutenzione future

1. Non mettere nuove funzioni dentro `app.js` se riguardano richieste o upload.
2. Non mettere logica GitHub dentro `menu.js`, salvo il caricamento del modulo `github-upload.js`.
3. Non cancellare file fallback finché la pagina sola lettura non è testata per più cicli.
4. Ogni nuova funzione deve stare nel modulo giusto.
5. Se un file supera troppe responsabilità, separarlo prima di aggiungere altre funzioni.

## Prossimo step consigliato

Ordine consigliato:

```txt
1. testare upload GitHub con token
2. testare pagina sola lettura dopo upload
3. pulire index.html eliminando markup vecchio
4. separare richieste admin da app.js
5. separare richieste sola lettura da lettura.js
6. valutare rimozione vecchi dati fallback
```
