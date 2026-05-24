// dashboard.jsx — BCM Dashboard: operational readiness across all business units

const { useState: useStateDB, useEffect: useEffectDB, useMemo: useMemoDB } = React;

/* ── Live clock for the page-head ────────────────────────────────── */
const DashboardClock = () => {
  const [now, setNow] = useStateDB(() => new Date());
  useEffectDB(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className="dash-clock" aria-label="Current date and time">
      <div className="dash-clock-row">
        <Icon name="dashboard" size={12} />
        <span className="dash-clock-date">{dateStr}</span>
      </div>
      <div className="dash-clock-time mono">{timeStr} <span className="dash-clock-zone">ICT</span></div>
    </div>
  );
};

/* ── KPI card ────────────────────────────────────────────────────── */
const Kpi = ({ label, value, delta, deltaDir, icon, tone, splits }) => (
  <div className={`kpi${tone ? " kpi-" + tone : ""}`}>
    {icon && <div className="kpi-icon"><Icon name={icon} size={14} stroke={2} /></div>}
    <div className="lbl">{label}</div>
    <div className="val">{value}</div>
    {splits ? (
      <div className="kpi-splits">
        {splits.map((s, i) => (
          <div key={i} className="kpi-split">
            <span className="kpi-split-dot" style={{ background: s.color }} />
            <span className="kpi-split-lbl">{s.label}</span>
            <span className="kpi-split-val mono">{s.value}</span>
          </div>
        ))}
      </div>
    ) : delta ? (
      <div className={`delta ${deltaDir || ""}`}>{delta}</div>
    ) : null}
  </div>
);

const ActivityPanel = () => (
  <div className="panel activity">
    <div className="panel-head">
      <h2>Activity</h2>
      <div className="meta">today</div>
      <div className="right"><button className="btn btn-sm">View all</button></div>
    </div>
    {BCM.SEED_ACTIVITY.map((a, i) => (
      <div className="row" key={i}>
        <div className="when">{a.when}</div>
        <div className="msg">
          <b>{a.who}</b> {a.msg} — <span style={{ color: a.tone==="warn" ? "var(--warn)" : a.tone==="ok" ? "var(--ok)" : "var(--ink-2)" }}>{a.target}</span>
        </div>
      </div>
    ))}
  </div>
);

const Dashboard = ({ showMap, onGo }) => {
  // Derived numbers
  const onDuty = BCM.SEED_USERS.filter(u => u.status !== "away").length;
  const openIncidents   = BCM.SEED_INCIDENTS.filter(i => i.status === "active" || i.status === "contained" || i.status === "monitoring").length;
  const closedIncidents = 27; // YTD demo total
  const drillAreas = BCM.SEED_SITES.filter(s => s.status !== "red").length; // sites currently safe for drill use
  // Call-tree status: percentage of users with confirmed contact info
  const callTreeChecked = BCM.SEED_USERS.filter(u => u.mobile && u.email && u.apps.includes("PORTAL")).length;
  const callTreeNotChecked = BCM.SEED_USERS.length - callTreeChecked;

  return (
    <div>
      <div className="page-head dashboard-head">
        <div>
          <h1>BCM Dashboard</h1>
          <div className="sub">Display readiness across all business units · <span className="mono" style={{ color:"var(--ink-2)" }}>{BCM.BUSINESS_UNITS.length} BUs · {BCM.SEED_SITES.length} sites · {BCM.SEED_USERS.length} contacts</span></div>
        </div>
        <div className="right">
          <DashboardClock />
          <span className="statuspill"><span className="dot" />Posture: <b style={{ marginLeft:4 }}>READY</b></span>
          <button className="btn btn-drill"><Icon name="bell" size={13} />Drill Exercise</button>
          <button className="btn btn-incident"><Icon name="shield" size={13} />Real Incident</button>
        </div>
      </div>

      <div className="kpis dashboard-kpis">
        <Kpi
          label="On-duty personnel"
          value={onDuty}
          icon="users"
          tone="ok"
          delta={`${onDuty} of ${BCM.SEED_USERS.length} reachable · ${BCM.SEED_USERS.length - onDuty} away`}
          deltaDir="up"
        />
        <Kpi
          label="Open incidents"
          value={openIncidents}
          icon="shield"
          tone="warn"
          delta={`${BCM.SEED_INCIDENTS.filter(i => i.status === "active").length} active · ${BCM.SEED_INCIDENTS.filter(i => i.status === "contained").length} contained`}
        />
        <Kpi
          label="Closed incidents"
          value={closedIncidents}
          icon="check"
          tone="ok"
          delta="YTD · 0 severity-1"
          deltaDir="up"
        />
        <Kpi
          label="Drill exercise area"
          value={drillAreas}
          icon="map"
          tone="info"
          delta={`${drillAreas} of ${BCM.SEED_SITES.length} sites cleared for drill`}
        />
        <Kpi
          label="Call-tree status"
          value={`${callTreeChecked}/${BCM.SEED_USERS.length}`}
          icon="phone"
          tone="ok"
          splits={[
            { label: "Checked",     value: callTreeChecked,    color: "var(--ok)" },
            { label: "Not checked", value: callTreeNotChecked, color: "var(--warn)" },
          ]}
        />
      </div>

      <div className="dash-grid">
        {showMap ? <OperationsMap users={BCM.SEED_USERS} /> : (
          <div className="panel" style={{ minHeight: 460, padding: 20, display:"grid", placeItems:"center", color:"var(--ink-3)" }}>
            Operations map disabled — toggle from Tweaks.
          </div>
        )}
        <ActivityPanel />
      </div>

      <div style={{ height: 18 }} />

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Active advisories</h2>
            <div className="meta">from Early Warning System</div>
            <div className="right"><button className="btn btn-sm" onClick={() => onGo("apps")}>Open EWS<Icon name="external" size={12} /></button></div>
          </div>
          <table className="tbl">
            <thead><tr><th>Hazard</th><th>Region</th><th>Severity</th><th>Issued</th><th>Affected BU</th></tr></thead>
            <tbody>
              <tr><td className="name">Tropical depression</td><td>Gulf of Thailand</td><td><span className="chip chip-warn chip-dot">Watch</span></td><td className="mono" style={{ color:"var(--ink-3)" }}>09:18</td><td>Logistics · Refinery (MTP)</td></tr>
              <tr><td className="name">Heat advisory</td><td>Bangkok metro</td><td><span className="chip chip-warn chip-dot">Watch</span></td><td className="mono" style={{ color:"var(--ink-3)" }}>07:02</td><td>Corporate HQ · Retail</td></tr>
              <tr><td className="name">Civil demonstration</td><td>Sriracha district</td><td><span className="chip chip-dot">Advisory</span></td><td className="mono" style={{ color:"var(--ink-3)" }}>yest.</td><td>Refinery (Sriracha)</td></tr>
              <tr><td className="name">Cyber phishing surge</td><td>Asia-Pacific</td><td><span className="chip chip-danger chip-dot">Warning</span></td><td className="mono" style={{ color:"var(--ink-3)" }}>yest.</td><td>All units</td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Plan status</h2>
            <div className="meta">freshness &amp; sign-off</div>
          </div>
          <table className="tbl">
            <thead><tr><th>Document</th><th>Version</th><th>Reviewed</th><th>State</th></tr></thead>
            <tbody>
              {BCM.SEED_DOCUMENTS.filter(d => d.bu === "Corporate / Shared").map((d, i) => (
                <tr key={i}>
                  <td className="name">{d.title}</td>
                  <td><span className="chip chip-mono">{d.version}</span></td>
                  <td className="mono" style={{ color:"var(--ink-3)" }}>{d.updated}</td>
                  <td><span className="chip chip-ok chip-dot">Current</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
