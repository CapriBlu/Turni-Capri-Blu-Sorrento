# Maintenance Audit - Turni Capri Blu

Data: 2026-07-08

## Stato generale

Il progetto è funzionante, ma alcune parti sono ancora in fase transitoria dopo il refactor.

Valutazione:

```txt
Stabilità: buona
Manutenibilità: media/buona
Rischio stratificazione: medio
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

Non cancellare ancora i fallback.

## Parti ordinate

- `menu.js` gestisce menu e pulsanti.
- `github-upload.js` gestisce solo upload GitHub con token richiesto al momento.
- `local-publish.js` gestisce autosave locale e preparazione JSON.
- `lettura.js` legge prima il nuovo registro e poi il vecchio fallback.
- `settings.js` gestisce admin reparto.

## Residui / punti da pulire

### 1. Nomi vecchi in `local-publish.js`

Sono ancora presenti funzioni con nomi storici:

```txt
saveDataToGitHub()
loadDataFromGitHub()
publishWeeklyShifts()
publishMonthlyData()
```

Non rompono l'app, ma sono nomi fuorvianti perché ora GitHub upload è in `github-upload.js`.

Soluzione futura:

```txt
saveDataToGitHub()     → exportLocalBackup()
loadDataFromGitHub()   → loadLocalBackupFallback()
publishWeeklyShifts()  → prepareWeeklyJson()
publishMonthlyData()   → prepareMonthlyJson()
```

Da fare solo dopo aver aggiornato `menu.js` e testato.

### 2. `app.js` troppo grande

`app.js` contiene:

```txt
turni
richieste admin
approvazione/rifiuto richieste
email conferma
indicatori calendario
```

Da separare in futuro:

```txt
app/requests-admin.js
app/schedule-core.js
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

### 4. HTML ancora contiene voci rimosse via JS

`index.html` contiene ancora:

```txt
Stampa
Messaggi personale
```

`menu.js` le rimuove dinamicamente. Non rompe, ma è un residuo.

Da pulire quando si riscrive `index.html` in modo più leggibile.

### 5. `github-sync.js` legacy

`github-sync.js` resta nel repo ma non è caricato.

Serve come fallback storico, però andrebbe spostato in:

```txt
app/legacy/github-sync.js
```

solo dopo aver testato bene `github-upload.js`.

## Regole di manutenzione future

1. Non mettere nuove funzioni dentro `app.js` se riguardano richieste o upload.
2. Non mettere logica GitHub dentro `menu.js`.
3. Non cancellare file fallback finché la pagina sola lettura non è testata per almeno qualche ciclo.
4. Ogni nuova funzione deve stare nel modulo giusto.
5. Se un file supera troppe responsabilità, separarlo prima di aggiungere altre funzioni.

## Prossimo step consigliato

Ordine consigliato:

```txt
1. testare upload GitHub con token
2. testare pagina sola lettura dopo upload
3. rinominare funzioni fuorvianti in local-publish.js
4. separare richieste admin da app.js
5. separare richieste sola lettura da lettura.js
6. rimuovere vecchie voci HTML dal menu
7. spostare github-sync.js in legacy
```
