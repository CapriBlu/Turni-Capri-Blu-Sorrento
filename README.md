# Turni Capri Blu Sorrento

Gestionale web leggero per creare, salvare, pubblicare e consultare i turni dello staff di Capri Blu Sorrento.

Questo README serve come manuale di manutenzione e ricostruzione. Se il sito si rompe, se una modifica crea problemi, o se bisogna ricostruire il progetto da capo, partire da qui.

---

## 1. Stato attuale del progetto

La struttura corretta e stabile è questa:

- una tabella principale unica per Sala, Pizzeria e Cucina / Lavaggio;
- un solo render principale della tabella dentro `script.js`;
- nessun modulo cucina esterno che aggiunge righe dopo;
- richieste integrate direttamente nelle celle della tabella;
- pubblicazione verso la pagina mensile con Sala + Pizzeria + Cucina;
- backup locale JSON e salvataggio GitHub che includono tutti i reparti.

Il principio più importante è: la tabella deve nascere già completa da `script.js`. Evitare moduli che modificano la tabella dopo il render principale, perché rendono il sito fragile.

---

## 2. File principali

### `index.html`

È la pagina principale del gestionale settimanale.

Contiene:

- card superiore con titolo e selezione settimana;
- pulsanti di salvataggio GitHub;
- toolbar con Presenze mensili, Invia al mensile, backup JSON, stampa e reset;
- legenda colori;
- tabella dei turni;
- form richieste;
- ordine di caricamento degli script.

L'ordine degli script è importante. Non spostare gli script senza verificare le dipendenze.

Ordine logico attuale:

```html
<script src="staff-data.js?v=1"></script>
<script src="script.js?v=21"></script>
<script src="js/weekly-switch-fix.js?v=1"></script>
<script src="shift-buttons.js?v=5"></script>
<script src="request-edit.js?v=1"></script>
<script src="publish-monthly.js?v=15"></script>
<script src="js/sections-ui.js?v=2"></script>
<script src="js/requests-panel-ui.js?v=1"></script>
<script src="js/top-menu-ui.js?v=1"></script>
<script src="js/menu-controls.js?v=1"></script>
<script src="js/archive-menu-fix.js?v=1"></script>
<script src="autosave-session.js?v=3"></script>
<script src="official-save.js?v=4"></script>
<script src="js/kitchen-save-hooks.js?v=1"></script>
<script src="github-sync.js?v=1"></script>
<script src="js/table-zoom-v3.js?v=4"></script>
<script src="js/undo-redo-controls.js?v=5"></script>
<script src="js/undo-redo-menu-fix.js?v=1"></script>
```

Quando si modifica un file JS o CSS, aumentare il numero `?v=` nel riferimento per evitare cache vecchia nel browser.

---

## 3. Cuore della tabella: `script.js`

`script.js` è il file principale. Gestisce:

- dati Sala;
- dati Pizzeria;
- dati Cucina / Lavaggio;
- render della tabella settimanale;
- cambio settimana;
- richieste;
- reset;
- salvataggio locale base.

### Reparti cucina/pizzeria

I reparti extra sono definiti in:

```js
const kitchenSections = [
  { key: "pizzeria", title: "Pizzeria", people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"] },
  { key: "cucina", title: "Cucina / Lavaggio", people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"] }
];
```

Per aggiungere una persona a Pizzeria o Cucina, modificare questa lista.

Per la Sala, i nomi principali arrivano da `staff-data.js` oppure dal fallback dentro `script.js`.

### Render corretto della tabella

La funzione importante è:

```js
renderTable()
```

La logica corretta è:

1. svuota `scheduleBody`;
2. crea sezione `Sala`;
3. crea righe Sala;
4. chiama `renderKitchenSections()`;
5. crea sezioni `Pizzeria` e `Cucina / Lavaggio`.

Non creare un secondo render esterno per cucina/pizzeria. Questo è il punto che in passato aveva reso fragile la tabella.

### Modifica celle

- Sala: usa `shift-buttons.js` con editor visuale.
- Pizzeria/Cucina: usa `editKitchenCell()` con prompt semplice.

Valori cucina accettati:

- `M`
- `S`
- `M/S`
- `Riposo`
- `12/chius`

---

## 4. Editor Sala: `shift-buttons.js`

Gestisce il popup di modifica turni per la Sala.

Dipende da variabili/funzioni globali definite in `script.js`, tra cui:

- `staff`
- `activeEdit`
- `days`
- `isWorking()`
- `detectPranzoStatus()`
- `detectSeraStatus()`
- `saveStaff()`
- `renderTable()`

Per questo motivo `shift-buttons.js` deve essere caricato dopo `script.js`.

Non eliminare `activeEdit`, `detectPranzoStatus` o `detectSeraStatus`: servono ancora all'editor Sala.

---

## 5. Sezioni apri/chiudi: `js/sections-ui.js`

Questo file deve restare leggero.

Fa solo:

- apertura/chiusura sezioni Sala, Pizzeria, Cucina;
- pulsante rapido `+` nella colonna Staff.

Non deve:

- creare righe Sala;
- creare righe cucina;
- normalizzare vecchie righe cucina;
- sovrascrivere il render della tabella con logica complessa.

La struttura corretta delle righe sezione è:

```html
<tr class="shift-section-row" data-section="sala|pizzeria|cucina">
```

Le righe appartenenti a una sezione devono avere:

```html
<tr data-section-group="sala|pizzeria|cucina">
```

---

## 6. Richieste staff

Le richieste sono gestite nel file principale `script.js` e rifinite da:

- `request-edit.js`
- `css/modules/requests.css`
- `css/modules/requests-panel.css`

### Comportamento corretto

Una richiesta compare:

- nella lista richieste;
- nella cella corrispondente come puntino giallo `.request-dot`;
- con colore cella diverso in base al tipo.

Classi principali:

- `.request-dot`
- `.request-pill`
- `.request-ferie`
- `.request-festa`
- `.request-altro`

Vecchie classi da non reintrodurre:

- `.request-badge`
- `.request-inline`

---

## 7. Pubblicazione al mensile: `publish-monthly.js`

Il pulsante `Invia al mensile` deve pubblicare sia Sala sia Pizzeria/Cucina.

Chiavi coinvolte:

Sala:

```txt
capriBluTurniStaffWeekV1-<settimana>
capriBluTurniStaffPublishedWeekV1-<settimana>
```

Pizzeria/Cucina:

```txt
capriBluTurniCucinaWeekV1-<settimana>
capriBluTurniCucinaPublishedWeekV1-<settimana>
```

La pagina mensile legge le chiavi `PublishedWeekV1`, quindi se il mensile non mostra i dati bisogna controllare prima `publish-monthly.js`.

---

## 8. Pagina mensile: cartella `presenze/`

La pagina `presenze/index.html` mostra le presenze mensili.

Il file principale è:

```txt
presenze/app.js
```

Deve leggere:

- Sala da `capriBluTurniStaffPublishedWeekV1-...`;
- Pizzeria/Cucina da `capriBluTurniCucinaPublishedWeekV1-...`.

La pagina mensile deve mantenere la stessa logica sezioni:

- Sala;
- Pizzeria;
- Cucina / Lavaggio.

---

## 9. Backup locale e autosalvataggio: `autosave-session.js`

Questo file crea snapshot completi del lavoro.

Lo snapshot deve includere:

- `staff`
- `weeklyStaff`
- `monthlyPublished`
- `kitchenWeekly`
- `kitchenMonthlyPublished`
- `requests`
- `currentWeek`
- `lastPublishedWeek`

Se il sito si rompe ma è ancora possibile scaricare il JSON, premere:

```txt
Scarica JSON
```

Il file scaricato è il modo più sicuro per ricostruire i turni.

Per ripristinare:

1. aprire il sito;
2. premere `Carica backup locale`;
3. selezionare il file JSON;
4. verificare Sala, Pizzeria/Cucina e richieste.

---

## 10. Salvataggio GitHub

I file coinvolti sono:

- `official-save.js`
- `github-sync.js`

### Carica da GitHub

Legge il salvataggio ufficiale da:

```txt
save/turni-attuali.json
```

tramite URL raw GitHub.

### Salva su GitHub

Aggiorna:

```txt
save/turni-attuali.json
```

usando un token GitHub inserito nel browser.

Il token resta solo nella sessione del browser, tramite `sessionStorage`.

Non mettere mai il token direttamente nel codice.

---

## 11. Hook salvataggio cucina: `js/kitchen-save-hooks.js`

Questo file collega Pizzeria/Cucina a:

- autosalvataggio;
- stato `Ufficiale + modifiche locali`.

Serve perché `saveKitchenData()` non passa da `saveStaff()`.

Senza questo file, modificare solo Pizzeria/Cucina potrebbe non aggiornare subito lo stato salvataggio.

---

## 12. Undo / Redo: `js/undo-redo-controls.js`

Gestisce:

- pulsante indietro;
- pulsante avanti;
- `Ctrl+Z`;
- `Ctrl+Y`;
- `Ctrl+Shift+Z`.

Lo snapshot deve includere:

- `staff`
- `requests`
- `kitchenData`
- `week`

Se si modifica Pizzeria/Cucina e Undo non funziona, controllare che `saveKitchenData()` sia agganciato dentro `undo-redo-controls.js`.

---

## 13. CSS e struttura grafica

File CSS principale:

```txt
css/modules.css
```

Importa i moduli CSS:

```txt
css/modules/monthly-fix.css
css/modules/shift-buttons.css
css/modules/requests.css
css/modules/requests-panel.css
autosave-session.css
css/modules/top-sync-buttons.css
top-menus.css
css/modules/sections.css
responsive.css
mobile-menu-controls.css
css/modules/archive-menu-fix.css
css/modules/zoom-fix.css
```

Quando si modifica un modulo CSS, aggiornare la versione in `css/modules.css` e possibilmente anche la versione di `css/modules.css` dentro `index.html`.

Esempio:

```html
<link rel="stylesheet" href="css/modules.css?v=12" />
```

---

## 14. Chiavi localStorage importanti

### Settimana selezionata

```txt
capriBluTurniSettimanaV2
```

### Sala

```txt
capriBluTurniStaffV5
capriBluTurniStaffWeekV1-<settimana>
capriBluTurniStaffPublishedWeekV1-<settimana>
```

### Pizzeria/Cucina

```txt
capriBluTurniCucinaWeekV1-<settimana>
capriBluTurniCucinaPublishedWeekV1-<settimana>
```

### Richieste

```txt
capriBluRichiesteStaffV1
```

### Backup sessione

```txt
capriBluAutoSessionBackupV1
```

### Stato GitHub / ufficiale

```txt
capriBluOfficialSaveLoadedAt
capriBluLocalChangesAfterOfficial
```

---

## 15. File rimossi / da non reintrodurre

Questi file o concetti sono stati rimossi perché creavano duplicazioni o fragilità:

```txt
request-render.js
request-notes.js
kitchen-main-integration.js
js/kitchen-main-clean.js
```

Non reintrodurre:

- un render cucina separato;
- vecchie classi `.kitchen-section-row`;
- vecchie classi `.request-badge`;
- vecchio popup note richieste;
- moduli che sovrascrivono `renderTable()` senza motivo forte.

---

## 16. Procedura se il sito si rompe

### 1. Controllare la console browser

Aprire il sito, poi strumenti sviluppatore e console.

Cercare errori tipo:

- funzione non definita;
- variabile non definita;
- errore localStorage;
- errore fetch GitHub.

### 2. Controllare ordine script in `index.html`

L'ordine più delicato è:

```txt
staff-data.js
script.js
shift-buttons.js
autosave-session.js
official-save.js
kitchen-save-hooks.js
github-sync.js
undo-redo-controls.js
```

Se uno di questi viene spostato, può rompersi una dipendenza globale.

### 3. Controllare `script.js`

Verificare che esistano ancora:

- `renderTable()`;
- `renderKitchenSections()`;
- `saveStaff()`;
- `saveKitchenData()`;
- `loadKitchenData()`;
- `saveRequests()`;
- `activeEdit`;
- `detectPranzoStatus()`;
- `detectSeraStatus()`.

### 4. Controllare cache

Se il codice è corretto ma il browser mostra ancora il vecchio comportamento:

- aumentare `?v=` in `index.html`;
- aumentare `?v=` in `css/modules.css`;
- svuotare cache del browser;
- ricaricare forzatamente.

### 5. Controllare il salvataggio

Se i dati non appaiono:

- verificare localStorage;
- premere `Carica da GitHub`;
- caricare backup JSON;
- controllare `save/turni-attuali.json`.

---

## 17. Procedura per ricostruire tutto da zero

Se il progetto si rompe completamente:

1. ripristinare `index.html` con ordine script corretto;
2. ripristinare `script.js` come render unico Sala + Pizzeria + Cucina;
3. ripristinare `staff-data.js` per i nomi Sala;
4. ripristinare `shift-buttons.js` per editor Sala;
5. ripristinare `publish-monthly.js` per invio al mensile;
6. ripristinare `presenze/app.js` per lettura mensile;
7. ripristinare `autosave-session.js` per backup JSON;
8. ripristinare `official-save.js` e `github-sync.js` per GitHub;
9. ripristinare `js/kitchen-save-hooks.js`;
10. ripristinare `js/undo-redo-controls.js`;
11. ripristinare CSS moduli;
12. caricare backup JSON o `save/turni-attuali.json`.

La priorità è sempre questa:

1. far renderizzare la tabella;
2. far salvare la settimana;
3. far salvare Pizzeria/Cucina;
4. far funzionare `Invia al mensile`;
5. far funzionare backup/GitHub;
6. rifinire mobile e grafica.

---

## 18. Test rapido dopo ogni modifica

Dopo ogni modifica importante fare questo test:

1. aprire sito da telefono;
2. modificare un turno Sala;
3. modificare un turno Pizzeria;
4. modificare un turno Cucina;
5. cambiare settimana e tornare indietro;
6. aggiungere una richiesta;
7. usare Undo/Redo;
8. premere `Invia al mensile`;
9. aprire `Presenze mensili`;
10. scaricare JSON;
11. salvare su GitHub se tutto è corretto.

Se uno di questi punti fallisce, non procedere con nuove funzioni: correggere prima il problema.

---

## 19. Regole di manutenzione

- Non duplicare `renderTable()`.
- Non creare moduli che aggiungono righe alla tabella dopo il render principale.
- Non spostare script senza controllare dipendenze.
- Non eliminare funzioni usate da altri file globali.
- Aggiornare sempre cache `?v=` dopo modifiche.
- Prima di pulire un file, cercare se funzioni/classi sono usate altrove.
- Preferire piccole modifiche progressive a grandi riscritture.
- Salvare su GitHub solo dopo test minimo.

---

## 20. Stato manutenibilità

Il progetto ora è abbastanza manutenibile perché:

- Sala, Pizzeria e Cucina sono nella stessa logica;
- i residui principali sono stati rimossi;
- il salvataggio JSON include tutti i reparti;
- GitHub salva il file ufficiale unico;
- la pagina mensile legge dati pubblicati separatamente ma coerenti;
- il README documenta come ricostruire il sistema.

Resta una caratteristica da ricordare: il progetto usa ancora molte variabili globali tra file JavaScript. Questo è normale per un sito statico semplice, ma rende importante l'ordine degli script.

---

## 21. Ultimo aggiornamento documentazione

Questa documentazione fotografa lo stato dopo la pulizia dei residui e l'integrazione completa di Sala, Pizzeria e Cucina nella tabella principale.
