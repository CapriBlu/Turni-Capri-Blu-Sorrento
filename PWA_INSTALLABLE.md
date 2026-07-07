# PWA Installabile — App Turni Capri Blu

Questo documento copre la Fase 10: rendere la futura app installabile su telefono, tablet e computer.

---

## Obiettivo

Creare una PWA, cioè una web app installabile come app normale.

Non serve partire subito da Play Store o App Store. La prima versione può funzionare dal browser, ma essere installabile sulla schermata principale del telefono.

---

## Perché PWA

Per Capri Blu è la strada più pratica perché:

- funziona su Android, iPhone, tablet e computer;
- si aggiorna dal web;
- non richiede pubblicazione immediata sugli store;
- può avere icona app;
- può avere schermata iniziale;
- può lavorare meglio con connessioni deboli se progettata bene.

---

## Componenti necessari

### Manifest

File previsto:

```txt
manifest.webmanifest
```

Contiene:

- nome app;
- nome breve;
- icone;
- colore tema;
- modalità display;
- pagina iniziale.

### Service worker

File previsto:

```txt
service-worker.js
```

Serve per:

- cache controllata;
- aggiornamenti versione;
- fallback se la rete è debole;
- caricamento più veloce.

### Icone

Dimensioni consigliate:

```txt
192x192
512x512
maskable icon
```

### Splash / tema

Usare stile Capri Blu:

- blu Capri;
- bianco crema;
- dettagli maiolica;
- logo leggibile.

---

## Funzioni offline

Prima versione:

- app si apre anche se rete instabile;
- mostra ultimo stato caricato;
- segnala se non può salvare.

Versione avanzata:

- modifica offline;
- coda sincronizzazione;
- risoluzione conflitti.

Per partire, meglio evitare modifiche offline complesse. Prima salvataggio online stabile.

---

## Aggiornamenti app

La PWA deve mostrare quando è disponibile una nuova versione.

Flusso consigliato:

1. nuovo deploy;
2. service worker rileva aggiornamento;
3. app mostra messaggio: Nuova versione disponibile;
4. utente aggiorna;
5. app ricarica in modo pulito.

---

## Permessi nella PWA

La PWA deve rispettare gli stessi ruoli:

- Admin;
- Manager;
- Employee;
- Viewer.

Anche se installata sul telefono, i permessi non dipendono dal dispositivo ma dall'utente collegato.

---

## Notifiche future

Non sono obbligatorie nella prima versione.

Possibili notifiche future:

- settimana pubblicata;
- richiesta approvata;
- richiesta rifiutata;
- modifica importante;
- promemoria pubblicazione mensile.

---

## Installazione utente

### Android

- aprire app nel browser;
- scegliere Installa app / Aggiungi a schermata Home;
- usare come app normale.

### iPhone

- aprire con Safari;
- Condividi;
- Aggiungi a schermata Home.

---

## Test Fase 10

La fase è completa quando:

1. l'app ha manifest valido;
2. l'app ha icona;
3. l'app è installabile su Android;
4. l'app è aggiungibile alla Home su iPhone;
5. l'app si apre a schermo intero;
6. il login funziona da app installata;
7. i permessi funzionano da app installata;
8. gli aggiornamenti non rompono la cache;
9. la versione nuova viene caricata correttamente;
10. il sito attuale resta disponibile come backup finché l'app non è stabile.

---

## Output finale Fase 10

La Fase 10 è completa quando l'app può essere usata dal telefono come app installabile, con login, permessi e salvataggio database funzionanti.
