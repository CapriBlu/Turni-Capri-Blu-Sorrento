# Refactor Safety Log - Turni Capri Blu

Questo file serve per sapere cosa viene modificato, perché viene modificato e come tornare indietro se qualcosa si rompe.

## Stato attuale del progetto

Data log: 2026-07-08

Il progetto è funzionante. Il refactor è stato avviato in modo controllato.

Token GitHub: disattivato temporaneamente.

## Obiettivo del refactor

Mantenere massima manutenibilità separando:

- turni
- richieste
- registro settimanale
- registro mensile
- settings admin reparto
- dati pubblici
- dati interni app

## Regola di sicurezza

Non fare spostamenti enormi in un solo commit.

Ogni fase deve seguire questo ordine:

1. creare nuova cartella o nuovo file
2. copiare/duplicare il contenuto
3. aggiornare UN SOLO percorso alla volta
4. testare
5. solo dopo eliminare il vecchio file

## Percorsi dati vecchi ancora esistenti

```txt
data/current-data.json
data/settimanale/current-week.json
data/mensile/current-month.json
data/settings/admins.json
```

Questi percorsi NON vanno cancellati finché i nuovi percorsi non sono testati.

## Percorsi dati nuovi

```txt
data/app/current-data.json
data/registry/weekly/current-week.json
data/registry/monthly/current-month.json
data/settings/admins.json
data/requests/pending-requests.json
```

## Fase 1 - Registro dati

### Fatto

```txt
data/app/current-data.json
data/registry/weekly/README.md
data/registry/weekly/current-week.json
data/registry/monthly/README.md
data/registry/monthly/current-month.json
data/requests/pending-requests.json
```

### Fatto anche

`app/lettura.js` ora legge così:

```txt
1. ../data/registry/weekly/current-week.json
2. fallback ../data/settimanale/current-week.json
```

Quindi se il nuovo registro non funziona, la pagina può ancora recuperare il vecchio file.

### Cache aggiornata

```txt
lettura.html → v=6
```

## Fase 1B - Pubblicazione locale ordinata

### Fatto

Creato nuovo file:

```txt
app/local-publish.js
```

Collegato in:

```txt
app/index.html
```

`github-sync.js` non è più caricato in `index.html`, ma resta nel repo come vecchio punto di sicurezza.

### Perché

La riscrittura completa di `github-sync.js` è stata evitata. Meglio non toccare un file storico se possiamo sostituirlo con un modulo nuovo, più leggibile e sicuro.

### Runtime admin attuale

Admin ora usa:

```txt
app/local-publish.js
```

Funzioni principali mantenute per compatibilità con `menu.js`:

```txt
saveDataToGitHub()
publishWeeklyOnline()
publishMonthlyOnline()
loadDataFromGitHub()
publishWeeklyShifts()
publishMonthlyData()
```

Nota: i nomi mantengono compatibilità ma la logica è solo locale, non usa token.

### Percorsi operativi indicati all'utente

```txt
current-data.json  → data/app/current-data.json
current-week.json  → data/registry/weekly/current-week.json
current-month.json → data/registry/monthly/current-month.json
```

### Cache aggiornata

```txt
index.html → v=18
```

## Runtime attuale

Pagina sola lettura:

```txt
app/lettura.js
→ tenta data/registry/weekly/current-week.json
→ fallback data/settimanale/current-week.json
→ legge data/settings/admins.json
```

Admin:

```txt
app/local-publish.js
→ autosave locale
→ prepara/scarica current-data.json
→ prepara/scarica current-week.json
→ prepara/scarica current-month.json
```

## Fase 2 futura - Separazione JS

Da fare solo dopo test dati:

```txt
app/requests-admin.js
app/requests-read.js
app/read-schedule.js
```

Obiettivo: alleggerire `app.js` e `lettura.js`.

## Fase 3 futura - Separazione CSS

Da fare solo dopo JS stabile:

```txt
app/css/app.css
app/css/app-responsive.css
app/css/lettura.css
```

## Come tornare indietro se qualcosa si rompe

### Caso 1 - pagina sola lettura non carica turni

Ripristinare in `app/lettura.js` il fetch unico verso:

```txt
../data/settimanale/current-week.json
```

Oppure lasciare attivo solo il fallback vecchio.

### Caso 2 - settings reparto non carica email

Ripristinare fallback fisso:

```txt
Pawel.petruk@hotmail.com
```

### Caso 3 - admin non salva o non pubblica localmente

In `app/index.html`, sostituire:

```txt
local-publish.js?v=18
```

con:

```txt
github-sync.js?v=17
```

Questo riattiva il vecchio modulo locale precedente.

### Caso 4 - menu non apre viste

Controllare `app/menu.js` e i pulsanti con:

```txt
data-menu-view="turni"
data-menu-view="richieste"
data-menu-view="mensile"
data-menu-view="archivio"
data-menu-view="settings"
```

## Regola finale

Prima di cancellare un file vecchio:

1. il nuovo percorso deve esistere
2. il codice deve leggerlo correttamente
3. la pagina deve essere testata con CTRL + F5
4. il vecchio percorso deve restare almeno una fase come fallback

## Ultimo punto sicuro

Punto sicuro attuale:

- token disattivato
- settings admin reparto aggiunti
- pagina sola lettura con fallback doppio
- registro nuovo creato
- vecchio registro ancora presente
- admin usa `local-publish.js`
- `github-sync.js` resta come fallback non caricato

Se qualcosa si rompe, ricollegare `github-sync.js` o tornare al vecchio percorso `data/settimanale/current-week.json`.
