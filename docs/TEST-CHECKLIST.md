# Capri Blu Turni - Checklist test manuale

Usare questa checklist dopo ogni modifica importante.

Obiettivo: capire subito se una modifica ha rotto menu, turni, archivio, richieste o salvataggi.

---

## Test mobile Android

### Apertura pagina

- [ ] La pagina si apre correttamente.
- [ ] Il titolo è leggibile.
- [ ] La tabella è visibile.
- [ ] Non ci sono elementi enormi in alto.

### Menu principale

- [ ] Il bottone `☰ Menu` si apre.
- [ ] Il menu si chiude cliccando fuori.
- [ ] Il menu si chiude con un comando interno.
- [ ] Calendario settimana visibile dentro menu.
- [ ] Bottoni GitHub visibili dentro menu.

### Legenda

- [ ] Il bottone `Legenda` si apre.
- [ ] I colori sono leggibili.
- [ ] La legenda si chiude correttamente.

### Archivio

- [ ] Menu `Archivio` si apre.
- [ ] `Archivio mensile` si apre.
- [ ] Il mese corrente compare sopra.
- [ ] La lista mesi è scrollabile.
- [ ] `Archivio settimanale` si apre.
- [ ] La settimana corrente compare sopra.
- [ ] Clic su una settimana cambia la settimana visualizzata.

### Zoom tabella

- [ ] Tasto `−` riduce la tabella.
- [ ] Tasto `+` ingrandisce la tabella.
- [ ] `Reset` torna a 100%.
- [ ] Lo zoom resta salvato dopo refresh.

### Sezioni turni

- [ ] Sezione Sala si apre/chiude.
- [ ] Sezione Cucina si apre/chiude.
- [ ] Sezione Pizzeria si apre/chiude, se presente.
- [ ] Le righe non spariscono in modo errato.

### Celle turni

- [ ] Toccare una cella apre editor.
- [ ] Si può modificare pranzo/mattina.
- [ ] Si può modificare sera.
- [ ] Si può impostare riposo.
- [ ] Si può chiudere editor.

### Richieste

- [ ] Bottone `Richieste` si apre.
- [ ] Si può aggiungere una richiesta.
- [ ] La richiesta compare nella settimana corretta.
- [ ] Si può chiudere il pannello richieste.

### GitHub e salvataggi

- [ ] `Salva su GitHub` risponde correttamente.
- [ ] `Carica da GitHub` risponde correttamente.
- [ ] Autosalvataggio locale resta attivo.
- [ ] Stato dati locali/ufficiali visibile dove previsto.

---

## Test desktop

### Layout

- [ ] Tabella larga e leggibile.
- [ ] Menu e legenda funzionano.
- [ ] Archivio funziona.
- [ ] Richieste funzionano.

### Funzioni

- [ ] Cambio settimana funziona.
- [ ] Stampa funziona.
- [ ] Scarica JSON funziona.
- [ ] Scarica backup locale funziona.
- [ ] Carica backup locale funziona.
- [ ] Invia al mensile funziona.

---

## Test dopo spostamento file

Quando si spostano file in `/js` o `/css`, controllare anche:

- [ ] Nessun errore 404 nella console browser.
- [ ] Tutti i file CSS sono caricati.
- [ ] Tutti i file JS sono caricati.
- [ ] `index.html` punta ai nuovi percorsi corretti.

---

## Regola di sicurezza

Se dopo una modifica si rompe qualcosa:

1. Non fare altre modifiche casuali.
2. Tornare all'ultimo blocco cambiato.
3. Verificare ordine script in `index.html`.
4. Verificare se un ID HTML è stato cambiato.
5. Ripristinare usando Git se necessario.
