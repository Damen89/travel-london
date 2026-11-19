// Metro: linee reali e stato in tempo reale dalla TfL Unified API (dati aperti TfL).
// Powered by TfL Open Data. Contiene dati OS © Crown copyright e database rights.
(() => {
  const API = "https://api.tfl.gov.uk";
  const MODES = "tube,elizabeth-line,dlr,overground";
  const KEY = (window.APP_CONFIG && window.APP_CONFIG.tflAppKey) || "";
  const GEO_TTL = 7 * 24 * 3600 * 1000;       // geometria: si riscarica ogni 7 giorni
  const STATUS_EVERY = 2 * 60 * 1000;          // stato: ogni 2 minuti mentre la scheda è aperta

  // Colori ufficiali delle linee (fallback grigio per linee nuove/sconosciute)
  const COLORS = {
    bakerloo: "#B36305", central: "#E32017", circle: "#FFD300", district: "#00782A",
    "hammersmith-city": "#F3A9BB", jubilee: "#A0A5A9", metropolitan: "#9B0056", northern: "#000000",
    piccadilly: "#003688", victoria: "#0098D4", "waterloo-city": "#95CDBA",
    elizabeth: "#6950A1", dlr: "#00A4A7", "london-overground": "#EE7C0E",
    liberty: "#61686B", lioness: "#FAA61A", mildmay: "#437EC1", suffragette: "#39B97A",
    weaver: "#972861", windrush: "#EF4D5E"
  };
  const color = id => COLORS[id] || "#7a7a7a";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const url = path => API + path + (KEY ? (path.includes("?") ? "&" : "?") + "app_key=" + encodeURIComponent(KEY) : "");
  const getJSON = async path => { const r = await fetch(url(path)); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); };
  const cache = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  let map, linesLayer, stationsLayer, meMarker, geo = null, status = {}, statusAt = 0, timer = null, pane = "lines";
  const $ = id => document.getElementById(id);

  // ---------- dati ----------
  async function loadGeometry(force) {
    const c = cache.get("tube-geo");
    if (!force && c && Date.now() - c.at < GEO_TTL) return c.data;
    const lines = await getJSON(`/Line/Mode/${MODES}`);
    const out = { lines: [], stations: {} };
    const queue = lines.slice();
    const worker = async () => {
      while (queue.length) {
        const ln = queue.shift();
        try {
          const seq = await getJSON(`/Line/${ln.id}/Route/Sequence/outbound`);
          const paths = [];
          (seq.lineStrings || []).forEach(s => {
            try { JSON.parse(s).forEach(part => paths.push(part.map(([lon, lat]) => [lat, lon]))); } catch {}
          });
          out.lines.push({ id: ln.id, name: ln.name, mode: ln.modeName, paths });
          (seq.stopPointSequences || []).forEach(sq => (sq.stopPoint || []).forEach(sp => {
            const k = sp.topMostParentId || sp.stationId || sp.id;
            const st = out.stations[k] || (out.stations[k] = { name: (sp.name || "").replace(/ (Underground|DLR|Rail) Station$/, ""), lat: sp.lat, lon: sp.lon, lines: [] });
            if (!st.lines.includes(ln.id)) st.lines.push(ln.id);
          }));
        } catch (e) { /* una linea non disponibile non blocca le altre */ }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (!out.lines.length) throw new Error("nessuna linea ricevuta");
    cache.set("tube-geo", { at: Date.now(), data: out });
    return out;
  }
  async function loadStatus() {
    const data = await getJSON(`/Line/Mode/${MODES}/Status`);
    const s = {};
    data.forEach(l => s[l.id] = {
      name: l.name, mode: l.modeName,
      items: (l.lineStatuses || []).map(x => ({ sev: x.statusSeverity, text: x.statusSeverityDescription, reason: x.reason }))
    });
    status = s; statusAt = Date.now();
    cache.set("tube-status", { at: statusAt, data: s });
  }
  const isGood = id => { const s = status[id]; return !s || s.items.every(i => i.sev === 10); };
  const IT = { "Good Service": "Servizio regolare", "Minor Delays": "Ritardi lievi", "Severe Delays": "Ritardi gravi",
    "Part Closure": "Chiusura parziale", "Planned Closure": "Chiusura programmata", "Closed": "Chiusa",
    "Part Suspended": "Sospesa in parte", "Suspended": "Sospesa", "Reduced Service": "Servizio ridotto",
    "Special Service": "Servizio speciale", "Service Closed": "Servizio terminato", "Bus Service": "Bus sostitutivi",
    "Diverted": "Deviata", "Not Running": "Non in servizio", "Issues Reported": "Problemi segnalati",
    "No Issues": "Nessun problema", "Information": "Informazioni", "Change of frequency": "Frequenza modificata" };
  const statusText = id => { const s = status[id]; return s ? [...new Set(s.items.map(i => IT[i.text] || i.text))].join(", ") : "Stato non disponibile"; };

  // ---------- mappa linee ----------
  function initMap() {
    if (map) return;
    map = L.map("tube-map", { zoomControl: false, preferCanvas: true }).setView([51.507, -0.12], 12);
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · Powered by TfL Open Data'
    }).addTo(map);
    linesLayer = L.layerGroup().addTo(map);
    stationsLayer = L.layerGroup().addTo(map);
    map.on("zoomend", toggleStations);
  }
  function toggleStations() {
    if (map.getZoom() >= 13) { if (!map.hasLayer(stationsLayer)) map.addLayer(stationsLayer); }
    else if (map.hasLayer(stationsLayer)) map.removeLayer(stationsLayer);
  }
  function linePopup(id, name) {
    const good = isGood(id);
    return `<div class="pop"><div class="pop-name"><span class="ldot" style="background:${color(id)}"></span>${esc(name)}</div>
      <div class="pop-time" style="color:${good ? "#0a7d33" : "#c8102e"};font-weight:600">${esc(statusText(id))}</div></div>`;
  }
  function drawLines() {
    if (!geo) return;
    linesLayer.clearLayers(); stationsLayer.clearLayers();
    geo.lines.forEach(l => {
      const good = isGood(l.id);
      l.paths.forEach(p => {
        L.polyline(p, { color: "#fff", weight: 7, opacity: .9 }).addTo(linesLayer);
        L.polyline(p, { color: color(l.id), weight: 4, opacity: 1, dashArray: good ? null : "8 6" })
          .bindPopup(() => linePopup(l.id, l.name)).addTo(linesLayer);
      });
    });
    Object.values(geo.stations).forEach(st => {
      if (st.lat == null) return;
      const names = st.lines.map(id => (geo.lines.find(l => l.id === id) || {}).name || id);
      L.circleMarker([st.lat, st.lon], { radius: st.lines.length > 1 ? 5 : 3.5, color: "#1d1d1f", weight: 1.5, fillColor: "#fff", fillOpacity: 1 })
        .bindPopup(() => `<div class="pop"><div class="pop-name">${esc(st.name)}</div>` +
          st.lines.map((id, i) => `<div class="pop-time"><span class="ldot" style="background:${color(id)}"></span>${esc(names[i])}` +
            `${isGood(id) ? "" : ` — <b style="color:#c8102e">${esc(statusText(id))}</b>`}</div>`).join("") +
          `<a href="https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lon}&travelmode=transit" target="_blank" rel="noopener">Indicazioni →</a></div>`)
        .addTo(stationsLayer);
    });
    toggleStations();
  }

  // ---------- stato ----------
  function renderStatus() {
    const el = $("tube-status");
    const ids = Object.keys(status);
    if (!ids.length) { el.innerHTML = `<p class="muted">Stato non disponibile. Controlla la connessione e riprova.</p>`; return; }
    const order = { tube: 0, "elizabeth-line": 1, overground: 2, dlr: 3 };
    ids.sort((a, b) => (order[status[a].mode] ?? 9) - (order[status[b].mode] ?? 9) || status[a].name.localeCompare(status[b].name));
    const bad = ids.filter(id => !isGood(id)).length;
    const t = new Date(statusAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    let h = `<div class="st-head"><div><b>${bad ? bad + (bad === 1 ? " linea con problemi" : " linee con problemi") : "Servizio regolare su tutte le linee"}</b>
      <div class="muted">Aggiornato alle ${t} (ora italiana)</div></div><button class="btn" id="tube-refresh" style="flex:none">Aggiorna</button></div>`;
    ids.forEach(id => {
      const s = status[id], good = isGood(id);
      const reasons = [...new Set(s.items.map(i => i.reason).filter(Boolean))];
      h += `<details class="st-row${good ? "" : " bad"}"${good ? "" : ""}>
        <summary><span class="st-bar" style="background:${color(id)}"></span><span class="st-name">${esc(s.name)}</span>
        <span class="st-badge ${good ? "ok" : "ko"}">${esc(statusText(id))}</span></summary>
        ${reasons.length ? reasons.map(r => `<p class="st-reason">${esc(r)}</p>`).join("") : `<p class="st-reason muted">Nessun avviso.</p>`}
      </details>`;
    });
    h += `<p class="muted" style="font-size:12px;margin-top:14px">Powered by TfL Open Data. I testi degli avvisi sono in inglese.</p>`;
    el.innerHTML = h;
    $("tube-refresh").onclick = () => refreshStatus(true);
  }

  async function refreshStatus(manual) {
    const btn = $("tube-refresh"); if (btn) btn.textContent = "…";
    try { await loadStatus(); }
    catch { if (manual) msg("Impossibile aggiornare lo stato. Riprova tra poco."); }
    renderStatus(); drawLines();
  }

  function msg(text, sticky) {
    const m = $("tube-msg"); m.textContent = text; m.style.display = text ? "block" : "none";
    if (text && !sticky) setTimeout(() => { if (m.textContent === text) m.style.display = "none"; }, 4000);
  }

  // ---------- schede ----------
  function setPane(p) {
    pane = p;
    document.querySelectorAll(".seg button").forEach(b => b.classList.toggle("active", b.dataset.pane === p));
    document.querySelectorAll(".metro-pane").forEach(el => el.classList.toggle("active", el.id === "mp-" + p));
    if (p === "lines" && map) setTimeout(() => map.invalidateSize(), 50);
    if (p === "schema" && window.__showSchema) window.__showSchema();
  }
  document.querySelectorAll(".seg button").forEach(b => b.onclick = () => setPane(b.dataset.pane));

  $("tube-locate").onclick = () => {
    navigator.geolocation && navigator.geolocation.getCurrentPosition(p => {
      const ll = [p.coords.latitude, p.coords.longitude];
      if (meMarker) meMarker.setLatLng(ll);
      else meMarker = L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#1c7ed6", fillOpacity: 1 }).addTo(map);
      map.setView(ll, 15);
    }, () => msg("Posizione non disponibile: controlla i permessi"), { enableHighAccuracy: true, timeout: 10000 });
  };

  let started = false;
  window.Tube = {
    async show() {
      if (!started) {
        started = true;
        initMap();
        const cs = cache.get("tube-status"); if (cs) { status = cs.data; statusAt = cs.at; }
        const cg = cache.get("tube-geo"); if (cg) { geo = cg.data; drawLines(); }
        renderStatus();
        if (!geo) msg("Carico le linee della metro…", true);
        try { geo = await loadGeometry(false); msg(""); drawLines(); }
        catch { if (!geo) msg("Non riesco a scaricare le linee da TfL. Controlla la connessione e riapri la scheda.", true); started = !!geo; }
        refreshStatus(false);
      } else if (Date.now() - statusAt > STATUS_EVERY) refreshStatus(false);
      setPane(pane);
      clearInterval(timer);
      timer = setInterval(() => refreshStatus(false), STATUS_EVERY);
    },
    hide() { clearInterval(timer); }
  };
})();
