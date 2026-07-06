# Capri Blu Turni - Mappa progetto

Questa mappa serve per modificare il progetto senza rompere la pagina dei turni.

## Regola principale

Prima di modificare un file, capire sempre in quale zona si trova:

- `index.html` collega CSS e JavaScript.
- `script.js` è il cuore dei turni: modificare con molta cautela.
- I moduli `*-ui.js` gestiscono solo interfaccia.
- I file GitHub/autosave gestiscono salvataggio e sincronizzazione.
- I file CSS modulari correggono aree specifiche.

---

## HTML principale

### `index.html`

Contiene la struttura principale della pagina.

Non cambiare senza motivo questi ID:

```html
<table class="shift-table" id="shiftTable">
<tbody id="scheduleBody"></tbody>
```

Sono usati dagli script per creare e aggiornare la tabella turni.

Modificare `index.html` solo per:

- collegare nuovi CSS;
- collegare nuovi JS;
- cambiare ordine dei moduli;
- aggiungere sezioni principali già testate.

---

## JavaScript attivo

### Cuore dei turni

#### `script.js`

File più delicato del progetto.

Gestisce:

- creazione settimana;
- render tabella;
- editor turni;
- cambio settimana;
- salvataggio locale;
- richieste base.

Regola: non riscriverlo tutto insieme. Quando arriverà il momento, spostare una funzione alla volta in moduli separati.

---

### Dati staff

#### `staff-data.js`

Gestisce elenco staff e persistenza nomi.

Usato da `script.js` per creare la tabella.

---

### Moduli UI puliti

#### `sections-ui.js`

Gestisce:

- sezioni Sala / Cucina / Pizzeria;
- espandi / collassa sezioni;
- pulsante `+` nella colonna Staff;
- aggiunta persona da menu contestuale.

#### `requests-panel-ui.js`

Gestisce:

- pannello richieste modale;
- apertura e chiusura richieste;
- chiusura con ESC o click fuori.

#### `top-menu-ui.js`

Gestisce:

- menu principale;
- menu legenda;
- archivio mensile;
- archivio settimanale;
- spostamento toolbar dentro menu.

#### `menu-controls.js`

Sposta nel menu:

- calendario settimana;
- bottoni `Salva su GitHub` e `Carica da GitHub`.

#### `archive-menu-fix.js`

Rifinisce l'archivio:

- mese corrente sopra;
- settimana corrente sopra.

#### `table-zoom-v3.js`

Gestisce zoom tabella:

- zoom out fino al 70%;
- normale 100%;
- zoom in fino al 120%.

---

### Salvataggio e GitHub

#### `autosave-session.js`

Gestisce autosalvataggio locale/sessione.

#### `official-save.js`

Gestisce salvataggio/caricamento ufficiale.

#### `github-sync.js`

Gestisce la sincronizzazione con GitHub.

Questi file sono delicati. Modificarli solo per migliorare messaggi errore, validazione o gestione offline.

---

## CSS attivo

### Base e legacy

#### `style.css`

Stile base storico. Non usare per piccole correzioni.

#### `legacy-compact.css`

Compattezza storica accorpata. Evitare modifiche non necessarie.

---

### Moduli CSS

#### `sections.css`

Stile sezioni Sala/Cucina/Pizzeria.

#### `requests.css`

Colori e segnali richieste.

#### `requests-panel.css`

Stile pannello richieste modale.

#### `top-menus.css`

Stile menu principale, legenda e archivio.

#### `mobile-menu-controls.css`

Stile calendario e GitHub dentro menu.

#### `archive-menu-fix.css`

Scroll archivio e voce corrente in alto.

#### `zoom-fix.css`

Supporto CSS per zoom tabella.

#### `responsive.css`

Correzioni mobile/tablet generali.

---

## File legacy e backup

### `legacy-backup/`

Contiene file vecchi non caricati dalla pagina.

Non cancellare subito. Servono come recupero storico o confronto.

---

## Ordine attuale degli script in `index.html`

```html
<script src="staff-data.js?v=1"></script>
<script src="script.js?v=17"></script>
<script src="request-render.js?v=3"></script>
<script src="shift-buttons.js?v=2"></script>
<script src="request-notes.js?v=14"></script>
<script src="request-edit.js?v=1"></script>
<script src="publish-monthly.js?v=14"></script>
<script src="kitchen-main-integration.js?v=1"></script>
<script src="sections-ui.js?v=1"></script>
<script src="requests-panel-ui.js?v=1"></script>
<script src="top-menu-ui.js?v=1"></script>
<script src="menu-controls.js?v=1"></script>
<script src="archive-menu-fix.js?v=1"></script>
<script src="autosave-session.js?v=3"></script>
<script src="official-save.js?v=4"></script>
<script src="github-sync.js?v=1"></script>
<script src="table-zoom-v3.js?v=1"></script>
```

Non cambiare questo ordine senza motivo.

---

## Regole per modifiche future

1. Prima creare un nuovo modulo, poi collegarlo.
2. Non modificare `script.js` per correzioni grafiche.
3. Non usare `style.css` per patch mobile: usare moduli CSS o `responsive.css`.
4. Dopo ogni blocco fare test mobile.
5. Spostare file in cartelle `/js` e `/css` solo a blocchi piccoli.
