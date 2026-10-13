// Live hazard feed for the BCM Portal landing page.
// Pulls recent GDACS alerts and USGS earthquakes (M4.5+) and keeps only events
// inside the Southeast Asia window where SCG sites operate.
const BOX = { minLon: 88, maxLon: 132, minLat: -12, maxLat: 30 };
const inBox = (lon, lat) =>
  Number.isFinite(lon) && Number.isFinite(lat) &&
  lon >= BOX.minLon && lon <= BOX.maxLon && lat >= BOX.minLat && lat <= BOX.maxLat;
const day = (d) => d.toISOString().slice(0, 10);
const TYPE = { EQ: "EQ", TC: "TC", FL: "FL", VO: "VO", WF: "WF", DR: "DR" };

async function getJSON(url) {
  const r = await fetch(url, { headers: { accept: "application/json", "user-agent": "scg-bcm-portal/1.0" }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function gdacs(from, to) {
  const url = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ;TC;FL;VO;WF;DR&fromDate=${day(from)}&toDate=${day(to)}&alertlevel=Green;Orange;Red`;
  const j = await getJSON(url);
  return (j.features || []).flatMap((f) => {
    const p = f.properties || {};
    const [lon, lat] = (f.geometry && f.geometry.coordinates) || [];
    if (!inBox(lon, lat)) return [];
    return [{
      id: `gdacs-${p.eventtype}-${p.eventid}`,
      source: "GDACS",
      type: TYPE[p.eventtype] || p.eventtype,
      alert: p.alertlevel,
      title: p.name || p.description || `${p.eventtype} ${p.country || ""}`.trim(),
      country: p.country,
      severity: p.severitydata && p.severitydata.severitytext,
      lat, lon,
      from: p.fromdate, to: p.todate,
      url: (p.url && p.url.report) || `https://www.gdacs.org/report.aspx?eventtype=${p.eventtype}&eventid=${p.eventid}`,
    }];
  });
}

async function usgs() {
  const j = await getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson");
  return (j.features || []).flatMap((f) => {
    const p = f.properties || {};
    const [lon, lat] = (f.geometry && f.geometry.coordinates) || [];
    if (!inBox(lon, lat)) return [];
    const alert = p.alert ? p.alert[0].toUpperCase() + p.alert.slice(1) : p.mag >= 6.5 ? "Orange" : "Green";
    return [{
      id: `usgs-${f.id}`, source: "USGS", type: "EQ", alert,
      title: p.title, place: p.place, mag: p.mag, lat, lon,
      from: new Date(p.time).toISOString(), url: p.url,
    }];
  });
}

export default async function handler(req, res) {
  const now = new Date();
  const from = new Date(now.getTime() - 21 * 864e5);
  const errors = [];
  const results = await Promise.allSettled([gdacs(from, now), usgs()]);
  let events = [];
  results.forEach((r, i) => (r.status === "fulfilled" ? events.push(...r.value) : errors.push(`${i ? "usgs" : "gdacs"}: ${r.reason && r.reason.message}`)));
  // Drop USGS quakes that GDACS already reports (same day, within ~50 km)
  events = events.filter((e) => !(e.source === "USGS" && events.some((g) => g.source === "GDACS" && g.type === "EQ" && Math.abs(g.lat - e.lat) < 0.5 && Math.abs(g.lon - e.lon) < 0.5 && String(g.from).slice(0, 10) === String(e.from).slice(0, 10))));
  // Keep events that started in the window or are still ongoing (floods, fires, drought last for weeks)
  events = events.filter((e) => new Date(e.from) >= from || (e.to && new Date(e.to) >= from) || e.type === "DR");
  const rank = { Red: 0, Orange: 1, Green: 2 };
  const typeRank = { TC: 0, FL: 1, WF: 2, VO: 3, DR: 4, EQ: 5 };
  events.sort((a, b) =>
    (rank[a.alert] ?? 3) - (rank[b.alert] ?? 3) ||
    (typeRank[a.type] ?? 6) - (typeRank[b.type] ?? 6) ||
    (b.mag || 0) - (a.mag || 0) ||
    String(b.from).localeCompare(String(a.from)));
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ updated: now.toISOString(), window_days: 21, count: events.length, events: events.slice(0, 40), errors });
}
