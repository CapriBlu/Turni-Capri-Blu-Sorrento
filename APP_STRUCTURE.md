# Struttura pulita app turni V1

Questa è la struttura ordinata della nuova app in `app/`.

Obiettivo: mantenere il progetto pulito, leggibile e modificabile senza creare strati inutili.

## Regola base

Ogni modifica deve seguire questo ordine:

1. Struttura
2. Dati
3. Grafica
4. Test
5. Pulizia finale

Ogni aggiunta deve chiudersi con controllo residui: pulsanti vecchi, classi CSS non usate, script non più necessari.

## File principali

- `app/index.html`  
  Struttura pagina, pannelli principali e ordine script.

- `app/app.css`  
  Grafica app ordinata per sezioni.

- `app/app.js`  
  Turni settimanali, richieste base, editor turno, salvataggio principale.

- `app/weekly-monthly.js`  
  Invio settimana al mensile, stato settimana pubblicata, tonalità settimana.

- `app/monthly.js`  
  Riepilogo mensile dalle settimane inviate.

- `app/archive.js`  
  Pagina Archivio separata: lista mesi, mese corrente lampeggiante, selezione mese.

- `app/theme.js`  
  Colori automatici delle celle.

- `app/menu.js`  
  Menu rapido alto, scorciatoie, backup JSON e stampa.

- `app/manifest.webmanifest`  
  Configurazione PWA.

## Confini

- `index.html`: solo struttura e script.
- `app.css`: solo grafica, senza CSS sparso fuori sezione.
- `app.js`: cuore turni e richieste.
- `weekly-monthly.js`: invio settimana al mensile.
- `monthly.js`: riepilogo mensile.
- `archive.js`: archivio mensile separato.
- `theme.js`: classi visive automatiche.
- `menu.js`: menu rapido e azioni locali semplici.

## LocalStorage

- `capriBluAppTurniByWeekV1`: turni per settimana.
- `capriBluAppCurrentWeekV1`: settimana selezionata.
- `capriBluAppRequestsV1`: richieste staff.
- `capriBluAppPublishedMonthlyWeeksV1`: settimane inviate al mensile.
- `capriBluAppDepartmentOpenV1`: reparti aperti/chiusi.
- `capriBluAppArchiveSelectedMonthV1`: mese selezionato in Archivio.

## Script caricati

```html
<script src="app.js?v=1"></script>
<script src="weekly-monthly.js?v=1"></script>
<script src="monthly.js?v=1"></script>
<script src="archive.js?v=1"></script>
<script src="theme.js?v=1"></script>
<script src="menu.js?v=1"></script>
```

## Test minimo

1. Aprire app.
2. Cambiare settimana.
3. Modificare una cella turno.
4. Aprire menu selezione turno.
5. Aprire menu alto.
6. Aprire Richieste.
7. Aprire Mensile.
8. Aprire Archivio.
9. Fare refresh e verificare che i dati restino salvati.
