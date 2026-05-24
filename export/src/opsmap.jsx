// opsmap.jsx — interactive operational-locations map with drill-down + radius rings

const { useState: useStateOM, useMemo: useMemoOM, useRef: useRefOM, useEffect: useEffectOM } = React;

// Thailand-ish bbox
const MAP_BBOX = { minLat: 6.0, maxLat: 20.7, minLng: 97.0, maxLng: 105.8 };

// km → percent of canvas (rough — 1° lat ≈ 111km; canvas height represents bbox range)
const kmToPct = (km, w, h) => {
  const latRange = MAP_BBOX.maxLat - MAP_BBOX.minLat;
  const latKm = latRange * 111;
  // use the smaller pixel dimension for radius scaling so circles stay round-ish
  const px = (km / latKm) * h;
  return { wPx: px * 2, hPx: px * 2 };
};

const project = (lat, lng) => ({
  x: ((lng - MAP_BBOX.minLng) / (MAP_BBOX.maxLng - MAP_BBOX.minLng)) * 100,
  y: (1 - (lat - MAP_BBOX.minLat) / (MAP_BBOX.maxLat - MAP_BBOX.minLat)) * 100,
});

const OperationsMap = ({ users }) => {
  const [statusFilter, setStatusFilter] = useStateOM(new Set(["green","yellow","red"]));
  const [buFilter, setBuFilter]         = useStateOM(new Set(BCM.BUSINESS_UNITS));
  const [selectedId, setSelectedId]     = useStateOM(null);
  const canvasRef = useRefOM(null);
  const [canvasSize, setCanvasSize]     = useStateOM({ w: 800, h: 460 });

  useEffectOM(() => {
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setCanvasSize({ w: r.width, h: r.height });
    });
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const sites = useMemoOM(
    () => BCM.SEED_SITES.filter(s => statusFilter.has(s.status) && buFilter.has(s.bu)),
    [statusFilter, buFilter]
  );

  const counts = useMemoOM(() => {
    return BCM.SEED_SITES.reduce(
      (acc, s) => { acc[s.status] = (acc[s.status]||0) + 1; return acc; },
      { green:0, yellow:0, red:0 }
    );
  }, []);

  const buCounts = useMemoOM(() => {
    const m = {};
    BCM.SEED_SITES.forEach(s => { m[s.bu] = (m[s.bu]||0) + 1; });
    return m;
  }, []);

  const selected = sites.find(s => s.id === selectedId) || BCM.SEED_SITES.find(s => s.id === selectedId);

  const toggleStatus = (k) => {
    const next = new Set(statusFilter);
    if (next.has(k)) next.delete(k); else next.add(k);
    if (next.size === 0) { setStatusFilter(new Set(["green","yellow","red"])); return; }
    setStatusFilter(next);
  };
  const toggleBU = (k) => {
    const next = new Set(buFilter);
    if (next.has(k)) next.delete(k); else next.add(k);
    if (next.size === 0) { setBuFilter(new Set(BCM.BUSINESS_UNITS)); return; }
    setBuFilter(next);
  };

  // personnel at the selected site (by BU)
  const personnelAtSite = useMemoOM(() => {
    if (!selected) return [];
    return users.filter(u => u.bu === selected.bu).slice(0, 5);
  }, [selected, users]);

  return (
    <div className="ops">
      <div className="panel-head">
        <h2>Operational locations</h2>
        <div className="meta">drill down by site · ring color = impact-radius band</div>
        <div className="right">
          <span className="statuspill"><span className="dot" />Network · ONLINE</span>
        </div>
      </div>

      <div className="ops-toolbar">
        <span style={{ fontSize: 11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase" }}>Status</span>
        {["green","yellow","red"].map(k => (
          <button key={k} className="statbtn"
            aria-pressed={statusFilter.has(k)}
            onClick={() => toggleStatus(k)}>
            <span className="swatch" style={{ background: BCM.STATUS_META[k].color }} />
            {BCM.STATUS_META[k].label}
            <span className="count">{counts[k]}</span>
          </button>
        ))}
        <span style={{ width: 1, height: 22, background:"var(--line)", margin: "0 4px" }} />
        <span style={{ fontSize: 11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase" }}>Unit</span>
        {BCM.BUSINESS_UNITS.map(bu => {
          const meta = BCM.BU_META[bu];
          return (
            <button key={bu} className="bu-pill"
              aria-pressed={buFilter.has(bu)}
              onClick={() => toggleBU(bu)}
              title={meta?.name}>
              <span className="swatch" style={{ background: meta?.color }} />
              {meta?.abbr || bu}
              <span style={{ fontFamily:"var(--font-mono)", fontSize:10.5, color:"var(--ink-4)", marginLeft:2 }}>{buCounts[bu]||0}</span>
            </button>
          );
        })}
      </div>

      {/* Radius band legend */}
      <div className="ops-bands">
        <span style={{ fontSize: 11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase" }}>Radius</span>
        {BCM.RADIUS_BANDS.slice().reverse().map(b => (
          <span key={b.id} className="ops-band" data-band={b.id}>
            <span className="ops-band-ring" style={{ background: b.soft, borderColor: b.color }} />
            <span className="ops-band-lbl">
              <b>{b.label}</b>
              <span className="ops-band-note">{b.note}</span>
            </span>
          </span>
        ))}
      </div>

      <div className="ops-canvas" ref={canvasRef} onClick={(e) => {
        if (e.target === canvasRef.current || e.target.classList.contains("ops-grid-bg")) setSelectedId(null);
      }}>
        <div className="ops-grid-bg" />
        {/* country silhouette */}
        <svg className="ops-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="country" d="M38,6 C46,7 53,12 56,18 C58,24 54,28 58,34 C64,40 68,44 66,52 C64,58 58,64 56,70 C54,78 50,84 46,88 C42,92 38,88 36,82 C32,74 28,68 30,60 C32,52 28,46 26,38 C24,30 30,22 34,16 C36,12 36,8 38,6 Z" />
        </svg>

        {sites.map(s => {
          const p = project(s.lat, s.lng);
          const { wPx, hPx } = kmToPct(s.radius_km, canvasSize.w, canvasSize.h);
          const isSel = selectedId === s.id;
          const meta = BCM.STATUS_META[s.status];
          const band = BCM.bandForRadius(s.radius_km);
          return (
            <button
              key={s.id}
              className="ops-pin"
              data-status={s.status}
              data-band={band.id}
              aria-selected={isSel}
              onClick={(e) => { e.stopPropagation(); setSelectedId(s.id); }}
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                "--status-color": meta.color,
                "--ring-color":   band.color,
                "--ring-soft":    band.soft,
              }}
            >
              {/* impact-radius circle, color-coded by band */}
              <span className="ring" style={{ width: wPx, height: hPx }} />
              <span className="ring inner" style={{ width: wPx*0.55, height: hPx*0.55 }} />
              <span className="radius-tag mono">{s.radius_km}km</span>
              <span className="dot" />
              <span className="label">
                {s.short}
                <small>{BCM.BU_META[s.bu]?.abbr} · <span style={{ color: band.color, fontWeight: 600 }}>{band.label.replace(" zone","").replace(" perimeter","")}</span></small>
              </span>
            </button>
          );
        })}

        {/* drill-down drawer */}
        <SiteDrawer
          site={selected}
          open={!!selected}
          users={personnelAtSite}
          onClose={() => setSelectedId(null)}
        />
      </div>

      <div className="map-legend">
        <span className="item"><span className="dot" style={{ background:"#117a4b" }} /> Normal</span>
        <span className="item"><span className="dot" style={{ background:"#a85a00" }} /> Monitoring</span>
        <span className="item"><span className="dot" style={{ background:"#b3261e" }} /> Critical</span>
        <span style={{ marginLeft:"auto", fontFamily:"var(--font-mono)", fontSize:10.5, color:"var(--ink-4)" }}>
          {sites.length} of {BCM.SEED_SITES.length} sites · ring = impact radius band
        </span>
      </div>
    </div>
  );
};

const SiteDrawer = ({ site, open, users, onClose }) => {
  if (!site) return <div className="ops-drawer" data-open="false" />;
  const meta = BCM.STATUS_META[site.status];
  const bu = BCM.BU_META[site.bu];
  const readiness = site.status === "green" ? 96 : site.status === "yellow" ? 72 : 41;
  return (
    <div className="ops-drawer" data-open={open ? "true" : "false"}>
      <div className="drawer-hd">
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
            <span className="chip chip-mono" style={{ background: bu?.soft, color: bu?.color, borderColor:"transparent" }}>{bu?.abbr}</span>
            <span className="chip chip-dot" style={{ background: meta.soft, color: meta.color, borderColor:"transparent" }}>{meta.label}</span>
          </div>
          <h3>{site.name}</h3>
          <div className="sub">{site.id} · {site.type} · {site.lat.toFixed(4)}, {site.lng.toFixed(4)}</div>
        </div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon name="close" size={14} /></button>
      </div>

      <div className="drawer-bd">
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div className="donut" style={{ "--p": readiness, "--c": meta.color }}>
            <span>{readiness}<small style={{ fontSize:9, color:"var(--ink-4)" }}>%</small></span>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase" }}>Readiness score</div>
            <div style={{ fontSize:12.5, color:"var(--ink-2)" }}>Plans current, drills passed, comms reachable.</div>
          </div>
        </div>

        <dl className="kv">
          <dt>Headcount</dt><dd className="mono">{site.headcount.toLocaleString()}</dd>
          <dt>Impact radius</dt><dd className="mono">{site.radius_km} km</dd>
          <dt>Advisories</dt><dd>{site.advisories > 0 ? <span className="chip chip-warn chip-dot">{site.advisories} active</span> : <span style={{ color:"var(--ink-3)" }}>None</span>}</dd>
          <dt>Site lead</dt><dd>{site.contact} <span className="mono" style={{ color:"var(--ink-3)" }}>· {site.phone}</span></dd>
        </dl>

        {site.incidents.length > 0 && (
          <div>
            <div style={{ fontSize:11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>Open incidents</div>
            {site.incidents.map(inc => (
              <div key={inc.id} style={{ border:"1px solid var(--line)", borderRadius:8, padding:"10px 12px", marginBottom:6 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                  <span className="chip chip-danger chip-dot">{inc.sev}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>{inc.id}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--ink-4)", marginLeft:"auto" }}>{inc.started}</span>
                </div>
                <div style={{ fontSize: 12.5, color:"var(--ink)" }}>{inc.title}</div>
              </div>
            ))}
          </div>
        )}

        <div>
          <div style={{ fontSize:11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>Personnel on site (sample)</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {users.length === 0 && <div style={{ color:"var(--ink-4)", fontSize:12 }}>No mapped personnel.</div>}
            {users.map(u => (
              <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 8px", border:"1px solid var(--line)", borderRadius:7 }}>
                <Avatar first={u.first} last={u.last} size={24} />
                <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2, minWidth:0 }}>
                  <span style={{ fontWeight:500, fontSize:12.5 }}>{u.first} {u.last}</span>
                  <span style={{ color:"var(--ink-4)", fontSize:11 }}>{u.bu} · <span className={`role role-${u.role}`}>{u.role}</span></span>
                </div>
                <span className="mono" style={{ marginLeft:"auto", fontSize:11, color:"var(--ink-3)" }}>{u.mobile}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="drawer-ft">
        <button className="btn"><Icon name="phone" size={13} />Call site</button>
        <button className="btn"><Icon name="bell" size={13} />Notify</button>
        <button className="btn btn-primary" style={{ marginLeft:"auto" }}><Icon name="external" size={13} />Open in IMAP</button>
      </div>
    </div>
  );
};

window.OperationsMap = OperationsMap;
