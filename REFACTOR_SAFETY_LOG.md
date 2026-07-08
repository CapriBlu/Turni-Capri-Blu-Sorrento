# Refactor Safety Log - Turni Capri Blu

Questo file serve per sapere cosa viene modificato, perché viene modificato e come tornare indietro se qualcosa si rompe.

## Stato attuale del progetto

Data log: 2026-07-08

Il progetto è funzionante ma sta iniziando a stratificarsi.

Parti stabili:

- pagina admin `app/index.html`
- pagina sola lettura `app/lettura.html`
- turni settimanali in `app/app.js`
- menu separato in `app/menu.js`
- autosave locale in `app/github-sync.js`
- settings reparto in `app/settings.js`
- pagina sola lettura con richieste e reparti a tendina

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

Questi percorsi sono ancora da considerare compatibili finché il refactor non è completato.

## Percorsi dati nuovi previsti

```txt
data/app/current-data.json
data/registry/weekly/current-week.json
data/registry/monthly/current-month.json
data/settings/admins.json
data/requests/pending-requests.json
```

## File già creati nella nuova struttura

```txt
data/app/current-data.json
data/registry/weekly/README.md
data/registry/monthly/README.md
data/requests/pending-requests.json
```

Nota: `data/registry/weekly/current-week.json` e `data/registry/monthly/current-month.json` non sono ancora stati attivati come percorsi runtime principali.

## Percorsi runtime attualmente usati

Pagina sola lettura:

```txt
app/lettura.js
→ legge ancora data/settimanale/current-week.json
→ legge data/settings/admins.json
```

Admin:

```txt
app/github-sync.js
→ prepara/scarica current-data.json
→ prepara/scarica current-week.json
→ prepara/scarica current-month.json
```

## Piano refactor controllato

### Fase 1 - Registro dati

Obiettivo: ordinare `data/` senza rompere lettura/admin.

Nuovo schema:

```txt
data/
├── app/
│   └── current-data.json
├── registry/
│   ├── weekly/
│   │   └── current-week.json
│   └── monthly/
│       └── current-month.json
├── settings/
│   └── admins.json
└── requests/
    └── pending-requests.json
```

Da fare con calma:

1. creare `data/registry/weekly/current-week.json`
2. creare `data/registry/monthly/current-month.json`
3. aggiornare `lettura.js` per leggere prima il nuovo percorso e usare il vecchio come fallback
4. aggiornare `github-sync.js` per scaricare file coerenti con la nuova struttura
5. testare sola lettura
6. solo dopo eliminare i vecchi percorsi

### Fase 2 - Separazione JS

Obiettivo: ridurre `app.js` e `lettura.js`.

Previsto:

```txt
app/requests-admin.js
app/requests-read.js
app/read-schedule.js
```

Non farlo prima di aver stabilizzato i dati.

### Fase 3 - Separazione CSS

Obiettivo futuro:

```txt
app/css/app.css
app/css/app-responsive.css
app/css/lettura.css
```

Da fare solo dopo che il JS è stabile.

## Come tornare indietro se qualcosa si rompe

### Caso 1 - pagina sola lettura non carica turni

Ripristinare in `app/lettura.js` il fetch verso:

```txt
../data/settimanale/current-week.json
```

### Caso 2 - settings reparto non carica email

Ripristinare fallback fisso:

```txt
Pawel.petruk@hotmail.com
```

### Caso 3 - admin non salva più localmente

Controllare `app/github-sync.js` e ripristinare solo autosave locale:

```txt
localStorage capriBluAppLastAutoSaveV1
```

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

Commit logico sicuro prima del grande refactor:

- token disattivato
- settings admin reparto aggiunti
- pagina sola lettura funzionante con `data/settimanale/current-week.json`
- admin funzionante in locale

Se qualcosa si rompe, tornare a questa logica e non cancellare i file vecchi.
