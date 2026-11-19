// Dati del viaggio — modificabili liberamente
const TRIP = {
  title: "Londra",
  subtitle: "28 nov – 2 dic 2026",
  home: { name: "Appartamento (Tooting)", lat: 51.4355, lng: -0.1595 },
  bookings: [
    { id: "b-bm", label: "British Museum — dom 29, 15:00", done: true },
    { id: "b-ng", label: "National Gallery — lun 30, 10:30", done: true },
    { id: "b-nhm", label: "Natural History Museum — mar 1, 15:00", done: true },
    { id: "b-sky", label: "Sky Garden — dom 29, ~18:00 (gratis, si prenota max 3 settimane prima)" },
    { id: "b-wa", label: "Abbazia di Westminster — lun 30 (ultimo ingresso 15:30)" },
    { id: "b-stp", label: "St Paul's Cathedral — mar 1, 8:30" },
    { id: "b-tol", label: "Tower of London — mar 1, 10:00" },
    { id: "b-ww", label: "Winter Wonderland — mar 1, ~19:00 (prenotazione obbligatoria)" },
    { id: "b-eye", label: "London Eye — lun 30, ~16:30 (facoltativo)" }
  ],
  days: [
    {
      id: "d1", label: "Sab 28", date: "2026-11-28", title: "West End e luci di Natale", color: "#d6336c",
      stops: [
        { time: "15:00", name: "Arrivo a Tooting, check-in", lat: 51.4355, lng: -0.1595, blurb: "Northern fino a Stockwell, poi Victoria line fino a Oxford Circus (~35 min)." },
        { time: "16:15", name: "Carnaby Street", lat: 51.51319, lng: -0.13885, blurb: "A 2 minuti da Oxford Circus. Negozi ancora aperti e luci già accese." },
        { time: "17:15", name: "Regent Street e Piccadilly Circus", lat: 51.50984, lng: -0.13435, blurb: "Scendi lungo Regent Street sotto le luci di Natale." },
        { time: "17:45", name: "Leicester Square", lat: 51.51036, lng: -0.13006, blurb: "Mercatino di Natale nella piazza." },
        { time: "18:15", name: "Neal's Yard e Covent Garden", lat: 51.51447, lng: -0.12635, blurb: "Il cortile colorato e le decorazioni di Covent Garden." },
        { time: "19:30", name: "Cena a Chinatown e Soho", lat: 51.51177, lng: -0.13115, blurb: "Rientro con la Northern line da Leicester Sq." }
      ]
    },
    {
      id: "d2", label: "Dom 29", date: "2026-11-29", title: "King's Cross, Camden, City", color: "#7048e8",
      stops: [
        { time: "9:30", name: "Harry Potter Shop, King's Cross", lat: 51.53207, lng: -0.12408, blurb: "Northern (treno \"via Bank\") fino a King's Cross St. Pancras (~35-40 min). Parti verso le 8:45." },
        { time: "11:00", name: "Camden Town e Camden Lock Market", lat: 51.54119, lng: -0.14625, blurb: "Northern line verso nord, 2 fermate. Pranzo con lo street food del mercato." },
        { time: "15:00", name: "British Museum", booking: "b-bm", lat: 51.51941, lng: -0.12696, blurb: "Prenotato. Da Camden: Northern line fino a Tottenham Court Rd, senza cambi. Chiude alle 17." },
        { time: "18:00", name: "Sky Garden", booking: "b-sky", lat: 51.51124, lng: -0.08355, blurb: "Gratis ma su prenotazione. Elizabeth line fino a Liverpool St. Di domenica aperto fino alle 21." },
        { time: "20:00", name: "Canary Wharf", lat: 51.50562, lng: -0.02641, blurb: "Grattacieli illuminati e cena. Rientro: Jubilee fino a London Bridge, poi Northern." }
      ]
    },
    {
      id: "d3", label: "Lun 30", date: "2026-11-30", title: "Royal London e Westminster", color: "#1c7ed6",
      stops: [
        { time: "8:45", name: "Green Park e Buckingham Palace", lat: 51.50136, lng: -0.14189, blurb: "Northern fino a Charing Cross, poi a piedi." },
        { time: "9:30", name: "St James's Park e Horse Guards", lat: 51.50478, lng: -0.12724, blurb: "Attraversa il parco fino alle Royal Horse Guards." },
        { time: "10:15", name: "Trafalgar Square", lat: 51.50804, lng: -0.12807, blurb: "Così sei all'ingresso puntuale." },
        { time: "10:30", name: "National Gallery", booking: "b-ng", lat: 51.50893, lng: -0.1283, blurb: "Prenotata. Pranzo in zona alla fine della visita." },
        { time: "14:00", name: "Abbazia di Westminster", booking: "b-wa", lat: 51.49937, lng: -0.1273, blurb: "Ultimo ingresso alle 15:30. Biglietto online." },
        { time: "15:45", name: "Palazzo di Westminster e Big Ben", lat: 51.50073, lng: -0.12463, blurb: "Le foto migliori sono dal Westminster Bridge." },
        { time: "16:30", name: "London Eye e South Bank", booking: "b-eye", lat: 51.50319, lng: -0.11952, blurb: "Il giro al tramonto, poi Northern da Waterloo." }
      ]
    },
    {
      id: "d4", label: "Mar 1", date: "2026-12-01", title: "City e South Kensington", color: "#0ca678",
      stops: [
        { time: "8:30", name: "Cattedrale di St Paul", booking: "b-stp", lat: 51.51385, lng: -0.09835, blurb: "Apre alle 8:30. Northern fino a Bank, poi 10 min a piedi." },
        { time: "10:00", name: "Torre di Londra", booking: "b-tol", lat: 51.50811, lng: -0.07595, blurb: "Vai subito ai Gioielli della Corona, prima che si formi la coda." },
        { time: "12:15", name: "Tower Bridge e London Bridge", lat: 51.50546, lng: -0.07536, blurb: "Attraversa il Tower Bridge e cammina lungo la riva sud." },
        { time: "12:45", name: "Pranzo al Borough Market", lat: 51.50558, lng: -0.09048, blurb: "Riparti entro le 14:15." },
        { time: "15:00", name: "Natural History Museum", booking: "b-nhm", lat: 51.49672, lng: -0.17637, blurb: "Prenotato. Jubilee fino a Westminster, poi District fino a South Kensington." },
        { time: "16:45", name: "Science Museum (breve)", lat: 51.49722, lng: -0.17673, blurb: "Edificio accanto, chiude alle 18: una o due gallerie." },
        { time: "18:00", name: "Harrods", lat: 51.49941, lng: -0.16323, blurb: "Vetrine di Natale, 10 minuti a piedi lungo Brompton Road." },
        { time: "19:00", name: "Hyde Park Winter Wonderland", booking: "b-ww", lat: 51.50736, lng: -0.16411, blurb: "Metro Knightsbridge. Prenotazione obbligatoria." }
      ]
    },
    {
      id: "d5", label: "Mer 2", date: "2026-12-02", title: "Rientro", color: "#f08c00",
      stops: [
        { time: "9:00", name: "Colazione a Tooting", lat: 51.4355, lng: -0.1595, blurb: "Mattinata tranquilla, valigia pronta." },
        { time: "10:45", name: "Partenza per Gatwick", lat: 51.44356, lng: -0.1524, blurb: "Northern fino a Balham, poi treno Southern per Gatwick. Verifica l'orario su National Rail." },
        { time: "12:00", name: "In aeroporto a Gatwick", lat: 51.15366, lng: -0.18206, blurb: "Due ore prima del volo delle 14." }
      ]
    }
  ]
};
