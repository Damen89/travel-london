# Londra 2026 — PWA

Web app installabile (Android e iPhone) con tre sezioni: **Tour**, **Mappe**, **Metro**.
Funziona offline dopo la prima apertura.

## Struttura
```
index.html      interfaccia e logica
data.js         itinerario (giorni, tappe, coordinate, prenotazioni) — modificalo qui
sw.js           service worker (cache offline + mattonelle mappa già viste)
manifest.json   dati per l'installazione
vendor/         Leaflet 1.9.4 (locale, niente CDN)
icons/          icone app
```

## Pubblicazione (serve HTTPS per l'installazione e l'offline)
GitHub Pages:
Repository: `Damen89/travel-london`
1. Settings → Pages → Source: `Deploy from a branch`, branch `main`, cartella `/ (root)`.
2. Dopo 1-2 minuti l'app è su `https://damen89.github.io/travel-london/`.

## Installazione sul telefono
- **iPhone (Safari):** apri l'indirizzo → Condividi → *Aggiungi alla schermata Home*.
- **Android (Chrome):** apri l'indirizzo → menu ⋮ → *Installa app* / *Aggiungi a schermata Home*.

Aprila una volta con la connessione attiva e sfoglia la mappa nelle zone del tour:
le mattonelle viste restano salvate e consultabili offline.

## Google Maps
La sezione Mappe usa Google Maps se in `config.js` c'è una chiave, altrimenti OpenStreetMap.
1. Google Cloud Console → crea un progetto e attiva la fatturazione (Google prevede una quota gratuita mensile).
2. *APIs & Services* → abilita **Maps JavaScript API**.
3. *Credentials* → *Create credentials* → *API key*.
4. Limita la chiave: *Application restrictions* → *Websites* → `https://damen89.github.io/*`;
   *API restrictions* → solo **Maps JavaScript API**.
5. Inserisci la chiave in `config.js` (`googleMapsKey`).
Se la chiave non è valida l'app torna da sola a OpenStreetMap.

## Mappa della metro
Due modi:
- **Nell'app:** sezione Metro → *Carica immagine* (resta salvata sul telefono).
- **Inclusa nell'app:** salva l'immagine come `metro.png` (o `.jpg` / `.webp`) nella cartella,
  aggiungi `"metro.png"` all'array `SHELL` in `sw.js`, incrementa `VERSION` e ripubblica.

## Aggiornamenti
Modifica i file (di solito `data.js`) e fai push su `main`: GitHub Pages ripubblica in 1-2 minuti.
Il service worker scarica prima dalla rete, quindi l'app mostra la nuova versione alla prima apertura
con connessione, senza reinstallarla. Incrementa `VERSION` in `sw.js` solo se aggiungi file
che devono essere disponibili offline (aggiungendoli anche a `SHELL`).
