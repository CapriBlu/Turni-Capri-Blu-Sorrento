# Struttura pulita app turni V1

Questa è la struttura ordinata della nuova app in `app/`.

Obiettivo principale: mantenere il progetto pulito, leggibile e modificabile senza creare strati inutili come nel vecchio gestionale.

## Principio operativo

Da ora in poi ogni modifica deve rispettare questo ordine:

1. **Struttura**: dove deve vivere la funzione?
2. **Dati**: quali chiavi/localStorage usa?
3. **Grafica**: quale sezione CSS tocca?
4. **Test**: cosa deve funzionare dopo la modifica?

Non si aggiungono funzioni nuove se prima non è chiaro dove inserirle.

## File principali

- `app/index.html`  
  Contiene solo la struttura della pagina, i pannelli principali e l'ordine degli script. Non deve contenere logica pesante.

- `app/app.css`  
  Contiene tutta la grafica della app. È ordinato per sezioni: base, header, navigazione, turni, editor turno, richieste, mensile, menu rapido, tonalità settimana e responsive.

- `app/app.js`  
  Motore principale: settimane, tabella turni, salvataggio locale, richieste staff e menu selezione turno.

- `app/weekly-monthly.js`  
  Gestisce il pulsante `Invia settimana al mensile`, lo stato della settimana pubblicata e la tonalità visiva della settimana.

- `app/monthly.js`  
  Genera il riepilogo mensile usando solo le settimane inviate al mensile.

- `app/theme.js`  
  Applica classi visive alle celle: riposo verde, turni speciali evidenziati, celle compilate.

- `app/menu.js`  
  Gestisce il menu rapido in alto.

- `app/manifest.webmanifest`  
  Configurazione PWA/installabile.

## Confini dei file

### `index.html`
Può contenere:
- contenitori principali;
- pulsanti principali;
- pannelli modali;
- ordine script.

Non deve contenere:
- funzioni JavaScript;
- CSS inline;
- script residui non usati.

### `app.css`
Può contenere:
- stile globale;
- layout;
- colori;
- responsive;
- sezioni commentate.

Non deve contenere:
- regole duplicate;
- stili casuali in fondo al file;
- classi non usate.

### `app.js`
Può contenere:
- gestione turni settimanali;
- gestione richieste base;
- editor selezione turno;
- salvataggio dati principali.

Non deve contenere:
- logica mensile avanzata;
- menu alto;
- solo grafica.

### `weekly-monthly.js`
Può contenere:
- invio della settimana al mensile;
- stato settimana inviata/non inviata;
- snapshot della settimana;
- tonalità visiva per settimana.

### `monthly.js`
Può contenere:
- lettura settimane pubblicate;
- calcoli del riepilogo mensile;
- render del pannello Mensile.

### `theme.js`
Può contenere:
- classi automatiche su celle;
- differenze visive tra riposo, turni e spezzati.

### `menu.js`
Può contenere:
- apertura/chiusura menu rapido;
- scorciatoie del menu alto.

## Regole per non stratificare

1. Non creare nuovi file JavaScript se una funzione appartiene chiaramente a un file esistente.
2. Non lasciare script non usati dentro `index.html`.
3. Non aggiungere CSS sparso: inserire ogni stile nella sezione corretta di `app.css`.
4. Prima di aggiungere nuove funzioni, controllare se si può pulire o integrare in modo semplice.
5. La tabella turni deve restare il cuore della app: richieste e mensile devono collegarsi ad essa, non duplicarla.
6. Ogni nuova funzione deve avere un solo proprietario: `app.js`, `weekly-monthly.js`, `monthly.js`, `theme.js` oppure `menu.js`.
7. Se una modifica tocca più di due file, prima va spiegata la ragione.
8. Dopo ogni modifica strutturale bisogna aggiornare questo documento.

## LocalStorage attuale

- `capriBluAppTurniByWeekV1`  
  Turni salvati per settimana.

- `capriBluAppCurrentWeekV1`  
  Ultima settimana selezionata.

- `capriBluAppRequestsV1`  
  Richieste staff.

- `capriBluAppPublishedMonthlyWeeksV1`  
  Settimane inviate al mensile.

## Script attuali caricati da index.html

Ordine corretto:

```html
<script src="app.js?v=1"></script>
<script src="weekly-monthly.js?v=1"></script>
<script src="monthly.js?v=1"></script>
<script src="theme.js?v=1"></script>
<script src="menu.js?v=1"></script>
```

Gli script `data-model.js` e `storage.js` sono stati rimossi perché erano residui non utilizzati.

## Checklist prima di ogni nuovo intervento

Prima di modificare il codice rispondere mentalmente a queste domande:

1. La modifica è strutturale, grafica o funzionale?
2. Qual è il file proprietario?
3. Devo toccare `index.html` o basta JS/CSS?
4. Sto duplicando una logica già esistente?
5. La modifica funziona su desktop e mobile?
6. Il salvataggio locale resta compatibile con i dati già presenti?

## Test minimo dopo ogni modifica

1. Aprire app.
2. Cambiare settimana.
3. Modificare una cella turno.
4. Aprire menu selezione turno.
5. Aprire menu alto.
6. Aprire Richieste.
7. Aprire Mensile.
8. Fare refresh pagina e verificare che i dati restino salvati.
