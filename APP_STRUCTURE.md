# Struttura pulita app turni V2

Questa è la struttura ordinata della web app turni Capri Blu.

Obiettivo: mantenere il progetto leggibile, modificabile e senza strati inutili.

## Regola base

Ogni modifica deve seguire questo ordine:

1. Struttura
2. Dati
3. Grafica
4. Test
5. Pulizia finale

Ogni aggiunta deve chiudersi con controllo residui: pulsanti vecchi, classi CSS non usate, script non più necessari, funzioni duplicate.

## Struttura app

```txt
app/
├── index.html
├── app.css
├── app-responsive.css
├── app.js
├── weekly-monthly.js
├── monthly.js
├── archive.js
├── github-sync.js
├── notifications.js
├── menu.js
├── theme.js
├── manifest.webmanifest
├── lettura.html
├── lettura.css
└── lettura.js
```

## File principali

- `app/index.html`  
  Struttura admin, pannelli principali, menu e ordine script.

- `app/app.css`  
  Grafica base desktop e componenti principali. Non deve contenere regole responsive.

- `app/app-responsive.css`  
  Solo tablet e telefono. Tutte le correzioni mobile/tablet vanno qui.

- `app/app.js`  
  Turni settimanali, richieste, editor turno e salvataggio locale principale.

- `app/weekly-monthly.js`  
  Registro mensile locale: prende la settimana corrente e la registra nel contenitore mensile.

- `app/monthly.js`  
  Riepilogo mensile dalle settimane registrate.

- `app/archive.js`  
  Archivio mensile e settimanale: grafico presenze, reparti, settimane registrate.

- `app/github-sync.js`  
  Per ora NON usa token. Gestisce autosave locale, preparazione backup admin, pubblicazione locale settimanale/mensile e download dei JSON.

- `app/notifications.js`  
  Prepara messaggi WhatsApp/email con link sola lettura.

- `app/menu.js`  
  Solo menu, navigazione e collegamento pulsanti. Non deve contenere logica GitHub, notifiche o archivio.

- `app/theme.js`  
  Colori automatici delle celle turno.

- `app/lettura.html`, `app/lettura.css`, `app/lettura.js`  
  Pagina collaboratori sola lettura. Legge solo il settimanale pubblicato.

## Dati

```txt
data/
├── current-data.json
├── settimanale/
│   └── current-week.json
└── mensile/
    └── current-month.json
```

- `data/current-data.json`  
  Backup admin completo.

- `data/settimanale/current-week.json`  
  File pubblicato per la pagina sola lettura settimanale.

- `data/mensile/current-month.json`  
  File pubblicato per il mensile.

## Confini

- `index.html`: solo struttura e script.
- `app.css`: grafica base desktop.
- `app-responsive.css`: solo tablet e telefono.
- `app.js`: cuore turni e richieste.
- `weekly-monthly.js`: registro mensile locale.
- `monthly.js`: riepilogo mensile.
- `archive.js`: archivio mensile/settimanale.
- `github-sync.js`: autosave locale e preparazione file dati.
- `notifications.js`: WhatsApp/email.
- `menu.js`: menu e navigazione.
- `lettura.js`: sola lettura settimanale.

## LocalStorage

- `capriBluAppTurniByWeekV1`: turni per settimana.
- `capriBluAppCurrentWeekV1`: settimana selezionata.
- `capriBluAppRequestsV1`: richieste staff.
- `capriBluAppPublishedMonthlyWeeksV1`: settimane registrate nel mensile.
- `capriBluAppDepartmentOpenV1`: reparti aperti/chiusi.
- `capriBluAppArchiveSelectedMonthV1`: mese selezionato in archivio.
- `capriBluAppArchiveModeV1`: archivio mensile o settimanale.
- `capriBluAppLastAutoSaveV1`: ultimo autosave locale.
- `capriBluAppPublishedWeeklyCurrentV1`: ultimo settimanale preparato localmente.
- `capriBluAppPublishedMonthlyCurrentV1`: ultimo mensile preparato localmente.

## Modalità attuale

Token GitHub disattivato temporaneamente.

Per ora:

```txt
Invia settimanale → prepara/scarica current-week.json
Invia mese        → prepara/scarica current-month.json
Backup admin      → prepara/scarica current-data.json
```

La pubblicazione online vera verrà riattivata dopo, con flusso sicuro.

## Test minimo

1. Aprire admin.
2. Cambiare settimana.
3. Modificare una cella turno.
4. Verificare autosave locale.
5. Aprire menu.
6. Provare Invia settimanale.
7. Provare Invia mese.
8. Aprire Richieste.
9. Aprire Presenze mensili.
10. Aprire Archivio mensile.
11. Aprire Archivio settimanale.
12. Aprire pagina sola lettura.
13. Verificare telefono/tablet.
14. Fare refresh e verificare che i dati restino salvati.
