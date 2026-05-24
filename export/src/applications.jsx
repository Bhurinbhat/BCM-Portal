// applications.jsx — Applications & Services screen

const AppCard = ({ app, onLaunch }) => (
  <div className="app-card" style={{ "--app-accent": app.accent, "--app-bg": app.bg }}>
    <div className="app-mark">{app.badge}</div>
    <div className="app-body" style={{ minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <h3 style={{ flex:1 }}>{app.name}</h3>
        {app.status === "operational"
          ? <span className="chip chip-ok chip-dot">Operational</span>
          : <span className="chip chip-warn chip-dot">Degraded</span>}
      </div>
      <div className="desc">{app.desc}</div>
      <div className="app-foot">
        {app.stats.map((s, i) => (
          <div className="app-stat" key={i}>
            <b>{s.v}</b>
            <small>{s.l}</small>
          </div>
        ))}
        <div className="app-row-btns">
          <button className="btn btn-sm" title="Settings"><Icon name="settings" size={12} /></button>
          <button className="btn btn-primary btn-sm" onClick={() => onLaunch(app)}>
            Launch <Icon name="external" size={12} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ApplicationsServices = () => {
  const [launched, setLaunched] = useState(null);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Applications &amp; Services</h1>
          <div className="sub">Connected BCM tooling — single sign-on, role-based access. All systems are monitored from this view.</div>
        </div>
        <div className="right">
          <button className="btn"><Icon name="shield" size={13} />Status page</button>
          <button className="btn btn-primary"><Icon name="plus" size={13} />Connect service</button>
        </div>
      </div>

      <div className="app-grid">
        {BCM.SEED_APPS.map(a => <AppCard key={a.code} app={a} onLaunch={setLaunched} />)}
      </div>

      <div style={{ height: 18 }} />

      <div className="panel">
        <div className="panel-head">
          <h2>Service health (last 24h)</h2>
          <div className="meta">tracked uptime &amp; response</div>
          <div className="right"><span className="statuspill"><span className="dot" />All systems normal</span></div>
        </div>
        <table className="tbl">
          <thead><tr><th>Service</th><th>Status</th><th className="num">Uptime</th><th className="num">P95 latency</th><th>Last incident</th><th>Owner</th></tr></thead>
          <tbody>
            {BCM.SEED_APPS.map(a => (
              <tr key={a.code}>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div className="app-mark" style={{ width:28, height:28, fontSize:11, borderRadius:7, background:a.bg, color:a.accent }}>{a.badge}</div>
                    <span className="name">{a.name}</span>
                  </div>
                </td>
                <td>{a.status === "operational"
                  ? <span className="chip chip-ok chip-dot">Operational</span>
                  : <span className="chip chip-warn chip-dot">Degraded</span>}</td>
                <td className="num">{a.status === "operational" ? "99.98%" : "99.41%"}</td>
                <td className="num">{a.status === "operational" ? "184 ms" : "4.2 s"}</td>
                <td className="mono" style={{ color:"var(--ink-3)" }}>{a.status === "operational" ? "—" : "today 08:14"}</td>
                <td>IT / Shared Services</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!launched}
        onClose={() => setLaunched(null)}
        title={launched ? `Launching ${launched.name}` : ""}
        subtitle="Single sign-on — handing off your BCM session."
        width={460}
        footer={<>
          <button className="btn" onClick={() => setLaunched(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setLaunched(null)}>Continue <Icon name="external" size={13} /></button>
        </>}
      >
        {launched && (
          <div style={{ display:"flex", gap:14, alignItems:"center" }}>
            <div className="app-mark" style={{ background:launched.bg, color:launched.accent }}>{launched.badge}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>{launched.name}</div>
              <div style={{ color:"var(--ink-3)", fontSize:12.5, marginTop:4 }}>{launched.desc}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

window.ApplicationsServices = ApplicationsServices;
