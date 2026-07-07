# Struttura pulita app turni V1

Questa è la struttura ordinata della nuova app in `app/`.

## File principali

- `app/index.html`  
  Contiene solo la struttura della pagina e l'ordine degli script. Non deve contenere logica pesante.

- `app/app.css`  
  Contiene tutta la grafica della app. È ordinato per sezioni: base, header, navigazione, turni, editor turno, richieste, mensile, menu rapido, responsive.

- `app/app.js`  
  Motore principale: settimane, tabella turni, salvataggio locale, richieste staff e menu selezione turno.

- `app/weekly-monthly.js`  
  Gestisce il pulsante `Invia settimana al mensile` e lo stato della settimana pubblicata.

- `app/monthly.js`  
  Genera il riepilogo mensile usando solo le settimane inviate al mensile.

- `app/theme.js`  
  Applica classi visive alle celle: riposo verde, turni speciali evidenziati, celle compilate.

- `app/menu.js`  
  Gestisce il menu rapido in alto.

- `app/manifest.webmanifest`  
  Configurazione PWA/installabile.

## Regole per non stratificare

1. Non creare nuovi file JavaScript se una funzione appartiene chiaramente a un file esistente.
2. Non lasciare script non usati dentro `index.html`.
3. Non aggiungere CSS sparso: inserire ogni stile nella sezione corretta di `app.css`.
4. Prima di aggiungere nuove funzioni, controllare se si può pulire o integrare in modo semplice.
5. La tabella turni deve restare il cuore della app: richieste e mensile devono collegarsi ad essa, non duplicarla.

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
