// ics.jsx — Incident Command System workspace

const { useState: useStateICS, useEffect: useEffectICS, useMemo: useMemoICS } = React;

/* ── Live clocks (ICT / UTC / device local) ────────────────────────── */
const useNow = () => {
  const [now, setNow] = useStateICS(() => new Date());
  useEffectICS(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

const pad2 = (n) => String(n).padStart(2, "0");

const ClockStrip = () => {
  const now = useNow();
  const ict = new Date(now.getTime() + (now.getTimezoneOffset() + 7*60) * 60 * 1000);
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const fmt = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  return (
    <div className="clocks" aria-label="System clocks">
      <div className="ics-clock"><span className="lbl">ICT</span><span className="val">{fmt(ict)}</span><span className="sub">Bangkok</span></div>
      <div className="ics-clock"><span className="lbl">UTC</span><span className="val">{fmt(utc)}</span><span className="sub">Zulu</span></div>
      <div className="ics-clock"><span className="lbl">LOC</span><span className="val">{fmt(now)}</span><span className="sub">device</span></div>
    </div>
  );
};

/* ── Risk-type chip ───────────────────────────────────────────────── */
const RISK_META = {
  "Natural":  { color:"#117a4b", bg:"#e3f3eb", icon:"map"    },
  "Man-Made": { color:"#a85a00", bg:"#fbecd6", icon:"shield" },
  "Pandemic": { color:"#7c3aed", bg:"#ede4ff", icon:"bell"   },
};
const RiskChip = ({ kind }) => {
  const m = RISK_META[kind] || { color:"var(--ink-3)", bg:"var(--bg-sunk)", icon:"shield" };
  return (
    <span className="risk-chip" style={{ color: m.color, background: m.bg, borderColor: m.color + "33" }}>
      <Icon name={m.icon} size={10} stroke={1.8} />{kind}
    </span>
  );
};

/* ── Incident header ──────────────────────────────────────────────── */
const IncidentHeader = ({ incident, totalActive, incharge }) => (
  <div className="ics-header">
    <div className="icon-wrap"><Icon name="shield" size={22} /></div>
    <div style={{ flex:"1 1 auto", minWidth: 0 }}>
      <h1>{incident.subject || incident.title_en}
        <span style={{ color:"var(--ink-3)", fontWeight: 500, fontSize: 14, marginLeft: 8 }}>· {incident.title_th}</span>
      </h1>
      <div className="sub">
        <span className="sev">{incident.severity}</span>
        <span className="chip chip-mono">{incident.id}</span>
        <RiskChip kind={incident.risk_type} />
        <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--ink-4)" }} />
        <span>started <b className="mono" style={{ color:"var(--ink-2)" }}>{incident.started}</b></span>
        {incharge && <>
          <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--ink-4)" }} />
          <span>in-charge <b style={{ color:"var(--ink-2)" }}>{incharge.first} {incharge.last}</b></span>
        </>}
        <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--ink-4)" }} />
        <span>📍 {incident.location_en} <span className="mono" style={{ color:"var(--ink-4)" }}>· {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</span></span>
      </div>
    </div>
    <div className="pulse-pill"><span className="dot" />{totalActive} active</div>
    <ClockStrip />
  </div>
);

/* ── Incident roster — structured card per incident ───────────────── */
const STATUS_TONE = {
  "active":     { label:"Active",     color:"var(--danger)", bg:"var(--danger-soft)", dot:"var(--danger)" },
  "contained":  { label:"Contained",  color:"#a85a00",       bg:"#fbecd6",            dot:"#c97a06" },
  "monitoring": { label:"Monitoring", color:"#1d4ed8",       bg:"#e0e9ff",            dot:"#1d4ed8" },
  "closed":     { label:"Closed",     color:"var(--ok)",     bg:"#e3f3eb",            dot:"var(--ok)" },
};

const IcField = ({ label, children }) => (
  <div className="icf-row">
    <div className="icf-lbl">{label}</div>
    <div className="icf-val">{children}</div>
  </div>
);

const IncidentStrip = ({ active, setActive }) => (
  <div className="incident-roster">
    {BCM.SEED_INCIDENTS.map(i => {
      const u  = BCM.SEED_USERS.find(x => x.id === i.incharge_uid);
      const st = STATUS_TONE[i.status] || STATUS_TONE.monitoring;
      return (
        <button
          key={i.id}
          className="incident-card"
          aria-pressed={active === i.id}
          onClick={() => setActive(i.id)}
          data-risk={i.risk_type}
        >
          <div className="ic-head">
            <span className="sev" data-s={i.severity}>{i.severity}</span>
            <div className="ic-subject">{i.subject || i.title_en}</div>
            <span className="ic-status" style={{ color: st.color, background: st.bg }}>
              <span className="dot" style={{ background: st.dot }} />{st.label}
            </span>
          </div>

          <div className="ic-id">
            <span className="mono">{i.id}</span>
            <span className="sep">·</span>
            <span>{i.title_th}</span>
          </div>

          <div className="ic-fields">
            <IcField label="Type of risk">
              <div className="icf-stack">
                <RiskChip kind={i.risk_type} />
                <span className="icf-sub">{i.type}</span>
              </div>
            </IcField>

            <IcField label="Start time">
              <div className="icf-stack">
                <span className="mono"><b>{i.started}</b></span>
                <span className="icf-sub">ICT · {i.location_en}</span>
              </div>
            </IcField>

            <IcField label="Emergency plan">
              {i.emergency_plan ? (
                <div className="erp-ref">
                  <Icon name="docs" size={11} stroke={1.8} />
                  <div className="icf-stack">
                    <span className="mono"><b>{i.emergency_plan.id}</b></span>
                    <span className="icf-sub">{i.emergency_plan.name.replace(/^ERP · /,"")}</span>
                  </div>
                </div>
              ) : <span className="icf-sub">— not linked</span>}
            </IcField>

            <IcField label="Person in charge">
              {u ? (
                <div className="ic-incharge">
                  <Avatar first={u.first} last={u.last} size={26} />
                  <div className="icf-stack">
                    <span><b>{u.first} {u.last}</b></span>
                    <span className="icf-sub">{u.bu}</span>
                  </div>
                </div>
              ) : <span className="icf-sub">— unassigned</span>}
            </IcField>
          </div>
        </button>
      );
    })}
  </div>
);

/* ── Org chart card ───────────────────────────────────────────────── */
const OrgCard = ({ pos, assignment, person, onEdit, includeUnits = false }) => {
  return (
    <div className={`org-card tone-${pos.tone}${pos.id === "IC" ? " tone-ic" : ""}`}>
      <div className="head">
        {pos.label}
        <button className="edit" onClick={() => onEdit(pos)} aria-label={`Assign ${pos.label}`}>
          <Icon name="edit" size={11} stroke={2} />
        </button>
      </div>
      <div className="body">
        {person ? (
          <>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
              <Avatar first={person.first} last={person.last} size={32} />
            </div>
            <div className="name">{person.first} {person.last}</div>
            <div className="role">{assignment.role}</div>
            <div className="phone">{assignment.phone}</div>
          </>
        ) : (
          <div className="empty">—</div>
        )}
      </div>
      {includeUnits && (
        <div className="units">
          {pos.units.map((u, i) => <div key={i} className="unit">{u}</div>)}
        </div>
      )}
    </div>
  );
};

/* ── Org chart with SVG connectors ────────────────────────────────── */
const OrgChart = ({ assignments, onEdit }) => {
  const findUser = (uid) => BCM.SEED_USERS.find(u => u.id === uid);
  const ic       = BCM.ICS_POSITIONS.find(p => p.id === "IC");
  const officers = ["SO","LO","PIO"].map(id => BCM.ICS_POSITIONS.find(p => p.id === id));
  const sections = ["OPS","PLAN","LOG","FIN"].map(id => BCM.ICS_POSITIONS.find(p => p.id === id));

  return (
    <div className="org">
      <div className="org-canvas">
        {/* IC row */}
        <div className="org-row">
          <OrgCard pos={ic} assignment={assignments.IC} person={findUser(assignments.IC?.uid)} onEdit={onEdit} />
        </div>

        {/* connector svg sits behind the rows but we render rows on top — use simple CSS via row separators */}
        <svg width="100%" height="32" viewBox="0 0 1080 32" preserveAspectRatio="none" style={{ marginTop:-12, marginBottom:-12 }} aria-hidden="true">
          <line x1="540" y1="0"   x2="540" y2="14" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="200" y1="14"  x2="880" y2="14" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="200" y1="14"  x2="200" y2="32" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="540" y1="14"  x2="540" y2="32" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="880" y1="14"  x2="880" y2="32" stroke="var(--line-2)" strokeWidth="1.5" />
        </svg>

        {/* Officer row */}
        <div className="org-row officers">
          {officers.map(o => (
            <OrgCard key={o.id} pos={o} assignment={assignments[o.id]} person={findUser(assignments[o.id]?.uid)} onEdit={onEdit} />
          ))}
        </div>

        {/* Trunk down from IC, branching to 4 sections */}
        <svg width="100%" height="40" viewBox="0 0 1080 40" preserveAspectRatio="none" style={{ marginTop:-14, marginBottom:-14 }} aria-hidden="true">
          <line x1="540" y1="0"   x2="540" y2="20" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="150" y1="20"  x2="930" y2="20" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="150" y1="20"  x2="150" y2="40" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="410" y1="20"  x2="410" y2="40" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="670" y1="20"  x2="670" y2="40" stroke="var(--line-2)" strokeWidth="1.5" />
          <line x1="930" y1="20"  x2="930" y2="40" stroke="var(--line-2)" strokeWidth="1.5" />
        </svg>

        {/* Section row */}
        <div className="org-row">
          {sections.map(s => (
            <OrgCard key={s.id} pos={s} assignment={assignments[s.id]} person={findUser(assignments[s.id]?.uid)} onEdit={onEdit} includeUnits />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Assign-role modal ────────────────────────────────────────────── */
const AssignModal = ({ pos, current, onClose, onAssign }) => {
  const [pick, setPick] = useStateICS(current?.uid || "");
  if (!pos) return null;
  return (
    <Modal
      open={!!pos}
      onClose={onClose}
      title={`Assign · ${pos.label}`}
      subtitle="Select a BCM contact for this ICS position."
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={!current} onClick={() => onAssign(null)}>
          <Icon name="close" size={13} />Clear assignment
        </button>
        <button className="btn btn-primary" disabled={!pick} onClick={() => onAssign(pick)}>
          <Icon name="check" size={13} />Assign
        </button>
      </>}
    >
      <div style={{ display:"flex", flexDirection:"column", gap: 6, maxHeight: 360, overflowY:"auto" }}>
        {BCM.SEED_USERS.map(u => (
          <label key={u.id} className="checkrow" style={{ cursor:"pointer", padding:"8px 10px" }}>
            <input type="radio" name="ics-assign" checked={pick === u.id} onChange={() => setPick(u.id)} />
            <Avatar first={u.first} last={u.last} size={26} />
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2, flex:1, minWidth:0 }}>
              <span style={{ fontWeight:500 }}>{u.first} {u.last}</span>
              <span style={{ color:"var(--ink-4)", fontSize:11 }}>{u.bu} · <span className={`role role-${u.role}`}>{u.role}</span></span>
            </div>
            <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>{u.mobile}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
};

/* ── Sub-views ────────────────────────────────────────────────────── */
const OverviewView = ({ incident, assignments }) => {
  const totalAssigned = Object.values(assignments).filter(Boolean).length;
  return (
    <>
      <div className="kpis" style={{ gridTemplateColumns:"repeat(4, 1fr)" }}>
        <div className="kpi"><div className="lbl">Active op-period</div><div className="val">4</div><div className="delta">12:00 → 24:00 ICT</div></div>
        <div className="kpi"><div className="lbl">Personnel checked-in</div><div className="val">{BCM.ICS_CHECKINS.filter(c => c.status === "in").length}</div><div className="delta up">+2 this period</div></div>
        <div className="kpi"><div className="lbl">ICS roles filled</div><div className="val">{totalAssigned}<span style={{ fontSize:14, color:"var(--ink-4)" }}>/8</span></div><div className="delta">command complete</div></div>
        <div className="kpi"><div className="lbl">Open log entries</div><div className="val">{BCM.ICS_LOGS.length}</div><div className="delta">since 06:14</div></div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Incident Action Plan · objectives</h2>
            <div className="meta">{incident.op_period || "Op Period 4 · 12:00 → 24:00"}</div>
            <div className="right"><button className="btn btn-sm"><Icon name="download" size={12} />Export IAP</button></div>
          </div>
          <div style={{ padding: "10px 18px 16px" }}>
            <ol style={{ paddingLeft: 18, margin: 0, color:"var(--ink-2)", fontSize: 13.5, lineHeight: 1.7 }}>
              {(incident.objectives || []).map((o, i) => (
                <li key={i} style={{ marginBottom: 6 }}>{o}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Quick command</h2></div>
          <div style={{ padding: 16, display:"grid", gridTemplateColumns:"1fr 1fr", gap: 10 }}>
            <button className="btn"><Icon name="phone" size={13} />Activate call tree</button>
            <button className="btn"><Icon name="bell" size={13} />Broadcast alert</button>
            <button className="btn"><Icon name="docs" size={13} />Open ERP</button>
            <button className="btn"><Icon name="map" size={13} />Open TACMAP</button>
            <button className="btn"><Icon name="upload" size={13} />Sit-rep</button>
            <button className="btn btn-danger"><Icon name="shield" size={13} />Escalate</button>
          </div>
        </div>
      </div>
    </>
  );
};

const RegistrationView = () => {
  const inCnt  = BCM.ICS_CHECKINS.filter(c => c.status === "in").length;
  const outCnt = BCM.ICS_CHECKINS.filter(c => c.status === "out").length;
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Personnel registration</h2>
        <div className="meta">arrivals at the incident</div>
        <div className="right">
          <span className="chip chip-ok chip-dot">In · {inCnt}</span>
          <span className="chip chip-warn chip-dot">Out · {outCnt}</span>
          <button className="btn btn-sm"><Icon name="plus" size={12} />Check in</button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>Time</th><th>Name</th><th>Role</th><th>Zone</th><th>Status</th><th>Phone</th><th></th></tr></thead>
        <tbody>
          {BCM.ICS_CHECKINS.map(c => (
            <tr key={c.id}>
              <td className="mono" style={{ color:"var(--ink-3)" }}>{c.time}</td>
              <td>
                <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
                  <Avatar first={c.first} last={c.last} size={24} />
                  <span className="name">{c.first} {c.last}</span>
                </div>
              </td>
              <td><span className="chip chip-mono">{c.role}</span></td>
              <td>{c.zone}</td>
              <td>{c.status === "in" ? <span className="chip chip-ok chip-dot">In zone</span> : <span className="chip chip-warn chip-dot">Out</span>}</td>
              <td className="mono">{c.phone}</td>
              <td><button className="iconbtn"><Icon name="edit" size={13} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const CheckInOutView = () => {
  const zones = [
    { name:"Command Post",    cap:20, in: 4, status:"green" },
    { name:"Staging Area · A",cap:60, in: 18,status:"yellow" },
    { name:"Planning Room",   cap:12, in: 6, status:"green" },
    { name:"Logistics Depot", cap:30, in: 9, status:"green" },
    { name:"Media Holding",   cap:10, in: 2, status:"green" },
    { name:"Triage Tent",     cap:24, in: 11,status:"yellow" },
    { name:"Field — Sector 2",cap:40, in: 14,status:"yellow" },
    { name:"Field — Sector 3",cap:40, in: 0, status:"red" },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Zone control</h2>
        <div className="meta">capacity vs. current headcount</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 12, padding: 16 }}>
        {zones.map((z, i) => {
          const pct = (z.in / z.cap) * 100;
          const meta = BCM.STATUS_META[z.status];
          return (
            <div key={i} style={{
              background:"var(--bg-panel)", border:"1px solid var(--line)", borderRadius: 10, padding: 12,
              borderTop: `3px solid ${meta.color}`,
            }}>
              <div style={{ fontWeight:600, fontSize:13.5, marginBottom: 4 }}>{z.name}</div>
              <div style={{ fontSize: 11, color:"var(--ink-3)" }}>{z.in} of {z.cap} · {z.status === "red" ? "no personnel" : meta.label}</div>
              <div style={{ height: 6, background:"var(--bg-sunk)", borderRadius:99, marginTop: 10, overflow:"hidden" }}>
                <div style={{ width: `${Math.max(pct, 4)}%`, height:"100%", background: meta.color, borderRadius:99 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TacMapView = ({ incident }) => (
  <div className="panel">
    <div className="panel-head">
      <h2>TACMAP · tactical operations map</h2>
      <div className="meta">{incident.location_en} · op-period 4</div>
      <div className="right"><button className="btn btn-sm"><Icon name="external" size={12} />Open in Intelligence Map</button></div>
    </div>
    <div style={{
      position:"relative", height: 460, overflow:"hidden", borderRadius:0,
      background: `radial-gradient(120% 100% at 50% 40%, #eaf0fb 0%, #e1e6f1 70%)`
    }}>
      <div className="map-grid" style={{ opacity:.5 }} />
      {/* Concentric perimeter rings around incident origin */}
      {[1,2,3].map(n => (
        <div key={n} style={{
          position:"absolute", left:"50%", top:"55%", transform:"translate(-50%,-50%)",
          width: 90 * n * 2, height: 90 * n * 2, borderRadius:"50%",
          border: `1.5px dashed ${n===1?"#b3261e":n===2?"#a85a00":"#1d4ed8"}`,
          opacity: 0.55 - n*0.1,
        }} />
      ))}
      {/* Origin */}
      <div style={{
        position:"absolute", left:"50%", top:"55%", transform:"translate(-50%,-50%)",
        width: 18, height: 18, borderRadius:"50%", background:"#b3261e",
        boxShadow:"0 0 0 4px #fff, 0 0 0 6px #b3261e",
      }} />
      {/* Sector pins */}
      {[
        { x: 38, y: 40, label:"Sector 2", c:"#a85a00" },
        { x: 62, y: 38, label:"Sector 3", c:"#b3261e" },
        { x: 30, y: 70, label:"Staging A", c:"#117a4b" },
        { x: 70, y: 70, label:"Triage", c:"#1d4ed8" },
      ].map((p, i) => (
        <div key={i} style={{ position:"absolute", left:`${p.x}%`, top:`${p.y}%`, transform:"translate(-50%,-50%)" }}>
          <div style={{
            width:14, height:14, borderRadius:"50%", background: p.c,
            boxShadow:"0 0 0 2px #fff, 0 0 0 3px var(--line-2)",
          }} />
          <div style={{
            position:"absolute", left:"50%", top:"100%", transform:"translateX(-50%)",
            background:"#fff", border:"1px solid var(--line)", padding:"2px 7px", marginTop:6,
            borderRadius:5, fontSize:10.5, fontWeight:500, whiteSpace:"nowrap"
          }}>{p.label}</div>
        </div>
      ))}
      <div style={{
        position:"absolute", left: 14, top: 14, background:"var(--bg-panel)",
        border:"1px solid var(--line)", borderRadius: 8, padding: "8px 12px", fontSize: 11.5,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Perimeter rings</div>
        <div style={{ display:"flex", gap: 12, color:"var(--ink-3)" }}>
          <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#b3261e", marginRight:6 }} />Hot · 200 m</span>
          <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#a85a00", marginRight:6 }} />Warm · 400 m</span>
          <span><span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#1d4ed8", marginRight:6 }} />Cold · 600 m</span>
        </div>
      </div>
    </div>
  </div>
);

const LogsView = () => (
  <div className="panel">
    <div className="panel-head">
      <h2>Incident log</h2>
      <div className="meta">chronological · most recent first</div>
      <div className="right">
        <button className="btn btn-sm"><Icon name="plus" size={12} />Add entry</button>
        <button className="btn btn-sm"><Icon name="download" size={12} />Export</button>
      </div>
    </div>
    <div className="logfeed">
      {BCM.ICS_LOGS.map((l, i) => (
        <div key={i} className="row">
          <div className="t">{l.t}</div>
          <div className="who">{l.who}</div>
          <div className="lvl" data-l={l.level}>{l.level.toUpperCase()}</div>
          <div className="msg">{l.msg}</div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Root ─────────────────────────────────────────────────────────── */
const IncidentCommand = () => {
  const [activeId, setActiveId] = useStateICS(BCM.SEED_INCIDENTS[0].id);
  const [tab, setTab] = useStateICS("chart");
  const [editing, setEditing] = useStateICS(null);
  const [assignments, setAssignments] = useStateICS(BCM.ICS_ASSIGNMENTS);

  const incident = BCM.SEED_INCIDENTS.find(i => i.id === activeId);
  const totalActive = BCM.SEED_INCIDENTS.filter(i => i.status === "active").length;

  const assign = (uid) => {
    if (!editing) return;
    const u = uid ? BCM.SEED_USERS.find(x => x.id === uid) : null;
    setAssignments(prev => ({
      ...prev,
      [editing.id]: uid
        ? { uid, role: editing.label, phone: u?.mobile || "" }
        : null,
    }));
    setEditing(null);
  };

  return (
    <div>
      <IncidentHeader
        incident={incident}
        totalActive={totalActive}
        incharge={BCM.SEED_USERS.find(u => u.id === incident.incharge_uid)}
      />

      <div className="ics-sysrow">
        <span className="chip chip-ok chip-dot">Cloud sync · 15:54</span>
        <span className="chip chip-accent chip-dot">Backup OK · 15:54</span>
        <span className="chip chip-warn chip-dot">DDPM linked</span>
      </div>

      <IncidentStrip active={activeId} setActive={setActiveId} />

      <div style={{ height: 16 }} />

      <div className="ics-tabs" role="tablist">
        {[
          { id:"overview", label:"Overview",         icon:"dashboard" },
          { id:"chart",    label:"Command Chart",    icon:"users" },
          { id:"reg",      label:"Registration",     icon:"users" },
          { id:"checkin",  label:"Check-in / out",   icon:"map" },
          { id:"tacmap",   label:"TACMAP",            icon:"map" },
        ].map(t => (
          <button key={t.id} role="tab" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={12} />{t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewView incident={incident} assignments={assignments} />}
      {tab === "chart" && <OrgChart assignments={assignments} onEdit={setEditing} />}
      {tab === "reg" && <RegistrationView />}
      {tab === "checkin" && <CheckInOutView />}
      {tab === "tacmap" && <TacMapView incident={incident} />}

      <AssignModal
        pos={editing}
        current={editing ? assignments[editing.id] : null}
        onClose={() => setEditing(null)}
        onAssign={assign}
      />
    </div>
  );
};

window.IncidentCommand = IncidentCommand;
