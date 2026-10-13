// ics.jsx — Incident Command System workspace

const { useState: useStateICS, useEffect: useEffectICS, useMemo: useMemoICS, useRef: useRefICS } = React;

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

/* ── Quick-Command modals ─────────────────────────────────────────── */

// 1. Activate Call Tree
const CallTreeModal = ({ open, onClose, incident, onActivate }) => {
  const [roles, setRoles] = useStateICS(new Set(["CMC", "BMT", "LMT"]));
  const [channel, setChannel] = useStateICS("voice+sms");
  const [phase, setPhase] = useStateICS("setup"); // setup | dialing | complete
  const [progress, setProgress] = useStateICS(0);

  useEffectICS(() => {
    if (!open) { setPhase("setup"); setProgress(0); setRoles(new Set(["CMC","BMT","LMT"])); }
  }, [open]);

  const targets = useMemoICS(() =>
    BCM.SEED_USERS.filter(u => roles.has(u.role)),
  [roles]);

  useEffectICS(() => {
    if (phase !== "dialing") return;
    if (progress >= targets.length) { setPhase("complete"); return; }
    const id = setTimeout(() => setProgress(p => p + 1), 220);
    return () => clearTimeout(id);
  }, [phase, progress, targets.length]);

  const toggleRole = (r) => setRoles(prev => {
    const next = new Set(prev); next.has(r) ? next.delete(r) : next.add(r); return next;
  });

  const start = () => { setProgress(0); setPhase("dialing"); };

  return (
    <Modal open={open} onClose={onClose} title="Activate call tree"
      subtitle={`Cascade alert · ${incident.id} · ${incident.subject || incident.title_en}`}
      width={620}
      footer={<>
        <button className="btn" onClick={onClose}>{phase === "complete" ? "Close" : "Cancel"}</button>
        {phase === "setup" && (
          <button className="btn btn-danger" disabled={targets.length === 0} onClick={start}>
            <Icon name="phone" size={13} />Activate · {targets.length} contacts
          </button>
        )}
        {phase === "complete" && (
          <button className="btn btn-primary" onClick={() => { onActivate?.({ roles:[...roles], channel, count: targets.length }); onClose(); }}>
            <Icon name="check" size={13} />Log to incident
          </button>
        )}
      </>}>
      {phase === "setup" && <>
        <div className="csv-section-title">Notify roles</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 8 }}>
          {["CMC", "BMT", "LMT"].map(r => {
            const count = BCM.SEED_USERS.filter(u => u.role === r).length;
            const on = roles.has(r);
            return (
              <button key={r} className="ct-rolebtn" data-on={on} onClick={() => toggleRole(r)}>
                <div className="ct-role-row">
                  <span className={`role role-${r}`}>{r}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>{count}</span>
                </div>
                <div className="ct-role-name">
                  {r === "CMC" ? "Crisis Management" : r === "BMT" ? "Business Management" : "Local Management"}
                </div>
              </button>
            );
          })}
        </div>
        <div className="csv-section-title">Channel</div>
        <div className="ct-channel">
          {[
            {k:"voice", l:"Voice call only", i:"phone"},
            {k:"voice+sms", l:"Voice + SMS fallback", i:"phone"},
            {k:"sms", l:"SMS only", i:"bell"},
          ].map(c => (
            <label key={c.k} className="checkrow" style={{ cursor:"pointer" }}>
              <input type="radio" checked={channel === c.k} onChange={() => setChannel(c.k)} />
              <Icon name={c.i} size={13} /><span>{c.l}</span>
            </label>
          ))}
        </div>
        <div style={{ marginTop:14, padding:12, background:"var(--bg-sunk)", border:"1px solid var(--line)", borderRadius:8, fontSize:12.5, color:"var(--ink-2)" }}>
          <b>{targets.length}</b> recipient{targets.length === 1 ? "" : "s"} will be paged in cascade order — CMC first, BMT 30s later, LMT after BMT acknowledges.
        </div>
      </>}
      {phase !== "setup" && (
        <div className="ct-progress">
          <div className="ct-progressbar"><div style={{ width: `${(progress/Math.max(targets.length,1))*100}%` }} /></div>
          <div className="ct-progress-lbl">
            {phase === "complete" ? `Cascade complete · ${targets.length} contacted` : `Dialing ${progress + 1} of ${targets.length}…`}
          </div>
          <div className="ct-callist">
            {targets.map((u, i) => {
              const state = i < progress ? "done" : i === progress && phase === "dialing" ? "ringing" : "pending";
              return (
                <div key={u.id} className="ct-call" data-s={state}>
                  <Avatar first={u.first} last={u.last} size={22} />
                  <span className="ct-call-name">{u.first} {u.last}</span>
                  <span className={`role role-${u.role}`} style={{ fontSize:10 }}>{u.role}</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--ink-4)" }}>{u.mobile}</span>
                  <span className="ct-call-state">
                    {state === "done" ? <><Icon name="check" size={11} /> ack</> :
                     state === "ringing" ? <><span className="ct-pulse" /> ringing</> :
                     "queued"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

// 2. Broadcast Alert
const ALERT_CHANNELS = [
  { k:"SMS",     label:"SMS",        icon:"phone",    color:"#117a4b", bg:"#def3e6" },
  { k:"EMAIL",   label:"Email",      icon:"docs",     color:"#1d4ed8", bg:"#e0e9ff" },
  { k:"TEAMS",   label:"MS Teams",   icon:"users",    color:"#5b5fc7", bg:"#e7e8fa" },
  { k:"LINE",    label:"Line OA",    icon:"bell",     color:"#06c755", bg:"#dff8ea" },
];

const BroadcastAlertModal = ({ open, onClose, incident, onBroadcast }) => {
  const [subject, setSubject] = useStateICS("");
  const [area, setArea]       = useStateICS("");
  const [country, setCountry] = useStateICS("Thailand");
  const [roles, setRoles]     = useStateICS(new Set(["CMC", "BMT"]));
  const [channels, setChannels] = useStateICS(new Set(["SMS", "EMAIL"]));
  const [body, setBody]       = useStateICS("");
  const [sending, setSending] = useStateICS(false);

  useEffectICS(() => {
    if (open) {
      setSubject(incident.subject || incident.title_en || "");
      setArea(incident.location_en || "");
      setCountry("Thailand");
      setRoles(new Set(["CMC", "BMT"]));
      setChannels(new Set(["SMS", "EMAIL"]));
      setBody(`Incident ${incident.id} — please acknowledge within 10 minutes.`);
      setSending(false);
    }
  }, [open, incident]);

  const toggle = (set, setter) => (v) => setter(prev => {
    const next = new Set(prev); next.has(v) ? next.delete(v) : next.add(v); return next;
  });

  const recipients = useMemoICS(() =>
    BCM.SEED_USERS.filter(u => roles.has(u.role)).length,
  [roles]);

  const valid = subject.trim() && area.trim() && roles.size > 0 && channels.size > 0;

  const send = () => {
    setSending(true);
    setTimeout(() => {
      onBroadcast?.({ subject, area, country, roles:[...roles], channels:[...channels], recipients });
      setSending(false);
      onClose();
    }, 700);
  };

  return (
    <Modal open={open} onClose={onClose} title="Broadcast alert"
      subtitle={`Multi-channel notification · ${incident.id}`} width={720}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={!valid || sending} onClick={send}>
          <Icon name="bell" size={13} />
          {sending ? "Broadcasting…" : `Send to ${recipients} · ${channels.size} channel${channels.size === 1 ? "" : "s"}`}
        </button>
      </>}>
      <div className="field">
        <label htmlFor="ba-sub">Incident subject</label>
        <input id="ba-sub" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short headline shown in the push" />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="ba-area">Area</label>
          <input id="ba-area" className="input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Map Ta Phut · Unit 3" />
        </div>
        <div className="field">
          <label htmlFor="ba-cty">Country</label>
          <select id="ba-cty" className="select" value={country} onChange={(e) => setCountry(e.target.value)}>
            {["Thailand", "Vietnam", "Indonesia", "Philippines", "Cambodia", "Lao PDR", "Myanmar"].map(c =>
              <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="csv-section-title">Notify to</div>
      <div className="ba-rolerow">
        {["CMC", "BMT", "LMT"].map(r => {
          const on = roles.has(r);
          const cnt = BCM.SEED_USERS.filter(u => u.role === r).length;
          return (
            <button key={r} className="ct-rolebtn" data-on={on} onClick={toggle(roles, setRoles)(r)}>
              <div className="ct-role-row">
                <span className={`role role-${r}`}>{r}</span>
                <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>{cnt}</span>
              </div>
              <div className="ct-role-name">
                {r === "CMC" ? "Crisis Management" : r === "BMT" ? "Business Management" : "Local Management"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="csv-section-title">Types of alert</div>
      <div className="ba-chanrow">
        {ALERT_CHANNELS.map(c => {
          const on = channels.has(c.k);
          return (
            <button key={c.k} className="ba-chanbtn" data-on={on} onClick={toggle(channels, setChannels)(c.k)}
              style={on ? { color: c.color, borderColor: c.color, background: c.bg } : null}>
              <div className="ba-chan-glyph" style={on ? { background: c.color, color:"#fff" } : null}>
                <Icon name={c.icon} size={14} />
              </div>
              <div className="ba-chan-name">{c.label}</div>
              <div className="ba-chan-status">{on ? "selected" : "off"}</div>
            </button>
          );
        })}
      </div>

      <div className="field">
        <label htmlFor="ba-body">Message</label>
        <textarea id="ba-body" className="input" rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
    </Modal>
  );
};

// 3. Site Map (was Sit-rep) — contour map + upload/view
const SiteMapModal = ({ open, onClose, incident }) => {
  const [files, setFiles] = useStateICS([
    { name:"site-contour-MTP.pdf", size:"1.4 MB", at:"08:42", who:"Krit P." },
    { name:"unit3-floorplan.png",  size:"640 KB", at:"08:48", who:"Niran C." },
  ]);
  const [viewing, setViewing] = useStateICS(null);
  const fileRef = useRefICS(null);

  const onPick = (e) => {
    const list = [...(e.target.files || [])];
    if (list.length === 0) return;
    setFiles(prev => [
      ...list.map(f => ({ name: f.name, size: (f.size/1024).toFixed(0)+" KB", at: new Date().toTimeString().slice(0,5), who:"You" })),
      ...prev,
    ]);
    e.target.value = "";
  };

  return (
    <Modal open={open} onClose={onClose} title="Site map · contour & overlays"
      subtitle={`${incident.location_en} · upload site plans, floor plans, contour maps`} width={840}
      footer={<>
        <button className="btn" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={13} />Upload file
        </button>
        <input ref={fileRef} type="file" multiple style={{ display:"none" }} onChange={onPick} accept=".pdf,.png,.jpg,.jpeg,.kmz,.kml,.dwg" />
      </>}>
      <div className="sitemap-canvas">
        <svg viewBox="0 0 800 360" style={{ width:"100%", height:"100%", display:"block" }}>
          <defs>
            <radialGradient id="sm-elev" cx="55%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="40%" stopColor="#fde68a" />
              <stop offset="80%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#86efac" />
            </radialGradient>
          </defs>
          <rect width="800" height="360" fill="url(#sm-elev)" />
          {/* contour lines */}
          {[40, 70, 100, 130, 160, 190].map((r, i) => (
            <ellipse key={i} cx="440" cy="170" rx={r*1.4} ry={r} fill="none" stroke="#7a4a00" strokeOpacity={0.35} strokeWidth="0.8" strokeDasharray={i%2 ? "4 3" : "0"} />
          ))}
          {/* roads */}
          <path d="M0 280 Q 200 230 400 250 T 800 220" stroke="#475569" strokeWidth="2.5" fill="none" />
          <path d="M460 0 L 440 360" stroke="#475569" strokeWidth="2" fill="none" strokeDasharray="6 4" />
          {/* perimeter */}
          <rect x="320" y="120" width="240" height="120" fill="none" stroke="#b3261e" strokeWidth="2" strokeDasharray="8 4" />
          <text x="328" y="115" fontSize="11" fill="#b3261e" fontFamily="ui-monospace,monospace">PLANT PERIMETER · Unit 3</text>
          {/* markers */}
          {[{x:440,y:170,c:"#b3261e",l:"Origin"},{x:380,y:200,c:"#117a4b",l:"Muster A"},{x:520,y:200,c:"#1d4ed8",l:"Cmd Post"}].map((m,i) => (
            <g key={i}>
              <circle cx={m.x} cy={m.y} r="6" fill={m.c} stroke="#fff" strokeWidth="2" />
              <text x={m.x + 10} y={m.y + 4} fontSize="10.5" fill="#1f2937">{m.l}</text>
            </g>
          ))}
          {/* legend */}
          <g transform="translate(16 16)">
            <rect width="170" height="68" fill="#ffffffea" stroke="#cbd5e1" rx="6" />
            <text x="10" y="18" fontSize="11" fontWeight="600" fill="#0f172a">Contour overlay</text>
            <text x="10" y="34" fontSize="10" fill="#475569">elev: yellow → green</text>
            <text x="10" y="48" fontSize="10" fill="#475569">dash: 10 m intervals</text>
            <text x="10" y="62" fontSize="10" fill="#b3261e">red box: incident perimeter</text>
          </g>
        </svg>
      </div>

      <div className="csv-section-title">Uploaded files · {files.length}</div>
      <div className="sm-filelist">
        {files.map((f, i) => (
          <div key={i} className="sm-file">
            <div className="sm-file-icon" data-ext={f.name.split('.').pop()}>{f.name.split('.').pop().toUpperCase()}</div>
            <div style={{ flex:"1 1 auto", minWidth:0 }}>
              <div className="sm-file-name">{f.name}</div>
              <div className="sm-file-meta">{f.size} · {f.at} ICT · {f.who}</div>
            </div>
            <button className="btn btn-sm" onClick={() => setViewing(f)}><Icon name="external" size={11} />View</button>
          </div>
        ))}
      </div>
      {viewing && (
        <div className="sm-viewer" onClick={() => setViewing(null)}>
          <div className="sm-viewer-head">
            <span>{viewing.name}</span>
            <button className="iconbtn" onClick={(e) => { e.stopPropagation(); setViewing(null); }}><Icon name="close" size={13} /></button>
          </div>
          <div className="sm-viewer-body">
            <Icon name="docs" size={48} />
            <div style={{ marginTop:10, color:"var(--ink-3)" }}>Preview not available — file would render in production</div>
            <div className="mono" style={{ marginTop:6, fontSize:11, color:"var(--ink-4)" }}>{viewing.size} · uploaded by {viewing.who}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// 4. Escalate → IMAP
const EscalateModal = ({ open, onClose, incident, onEscalate }) => {
  const [step, setStep] = useStateICS("confirm"); // confirm | linking | done
  useEffectICS(() => { if (open) setStep("confirm"); }, [open]);

  const go = () => {
    setStep("linking");
    setTimeout(() => setStep("done"), 900);
  };

  return (
    <Modal open={open} onClose={onClose} title="Escalate to IMAP"
      subtitle={`Hand off ${incident.id} to Incident Management Application`} width={560}
      footer={<>
        <button className="btn" onClick={onClose}>{step === "done" ? "Close" : "Cancel"}</button>
        {step === "confirm" && (
          <button className="btn btn-danger" onClick={go}>
            <Icon name="shield" size={13} />Escalate now
          </button>
        )}
        {step === "done" && (
          <button className="btn btn-primary" onClick={() => { onEscalate?.(); onClose(); }}>
            <Icon name="external" size={13} />Open in IMAP
          </button>
        )}
      </>}>
      {step === "confirm" && (
        <div style={{ padding:"6px 0 12px" }}>
          <div className="esc-card">
            <div className="esc-flow">
              <div className="esc-node esc-from">
                <div className="esc-glyph"><Icon name="shield" size={20} /></div>
                <div className="esc-label">BCM Portal · ICS</div>
                <div className="esc-sub mono">{incident.id}</div>
              </div>
              <div className="esc-arrow">
                <svg width="80" height="20"><line x1="0" y1="10" x2="74" y2="10" stroke="#b3261e" strokeWidth="2" /><polygon points="74,4 80,10 74,16" fill="#b3261e" /></svg>
              </div>
              <div className="esc-node esc-to">
                <div className="esc-glyph" style={{ background:"#1d4ed8", color:"#fff" }}><Icon name="external" size={20} /></div>
                <div className="esc-label">IMAP</div>
                <div className="esc-sub">Incident Management</div>
              </div>
            </div>
          </div>
          <ul className="esc-checks">
            <li><Icon name="check" size={12} /> Roster, ICS roles, and logs will be replicated.</li>
            <li><Icon name="check" size={12} /> IMAP case number will be issued automatically.</li>
            <li><Icon name="check" size={12} /> Quick-command actions remain available here in mirror mode.</li>
          </ul>
        </div>
      )}
      {step === "linking" && (
        <div style={{ padding:"30px 12px", textAlign:"center", color:"var(--ink-3)" }}>
          <span className="login-spinner" style={{ borderColor:"#b3261e44", borderTopColor:"#b3261e", width:28, height:28 }} />
          <div style={{ marginTop:14 }}>Opening secure channel to IMAP…</div>
        </div>
      )}
      {step === "done" && (
        <div style={{ padding:"6px 0" }}>
          <div className="esc-done">
            <div className="esc-done-icon"><Icon name="check" size={20} /></div>
            <div>
              <div style={{ fontWeight:600 }}>Escalated successfully</div>
              <div style={{ fontSize:12, color:"var(--ink-3)" }}>IMAP case <b className="mono">IMAP-2026-{incident.id.replace(/\D/g,"")}</b> created · all 8 ICS roles synced</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* ── Sub-views ────────────────────────────────────────────────────── */
const OverviewView = ({ incident, assignments, onOpenModal }) => {
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
          <div className="qcmd-grid">
            <button className="qcmd qcmd-call" onClick={() => onOpenModal("calltree")}>
              <span className="qcmd-glyph"><Icon name="phone" size={16} /></span>
              <span className="qcmd-lbl">Activate call tree</span>
              <span className="qcmd-sub">Cascade CMC → BMT → LMT</span>
            </button>
            <button className="qcmd qcmd-broadcast" onClick={() => onOpenModal("broadcast")}>
              <span className="qcmd-glyph"><Icon name="bell" size={16} /></span>
              <span className="qcmd-lbl">Broadcast alert</span>
              <span className="qcmd-sub">SMS · Email · Teams · Line OA</span>
            </button>
            <button className="qcmd" onClick={() => onOpenModal("erp")}>
              <span className="qcmd-glyph"><Icon name="docs" size={16} /></span>
              <span className="qcmd-lbl">Open ERP</span>
              <span className="qcmd-sub">Linked emergency plan</span>
            </button>
            <button className="qcmd" onClick={() => onOpenModal("tacmap")}>
              <span className="qcmd-glyph"><Icon name="map" size={16} /></span>
              <span className="qcmd-lbl">Open TACMAP</span>
              <span className="qcmd-sub">Radius + distance tools</span>
            </button>
            <button className="qcmd" onClick={() => onOpenModal("sitemap")}>
              <span className="qcmd-glyph"><Icon name="upload" size={16} /></span>
              <span className="qcmd-lbl">Site map</span>
              <span className="qcmd-sub">Contour · upload · view</span>
            </button>
            <button className="qcmd qcmd-danger" onClick={() => onOpenModal("escalate")}>
              <span className="qcmd-glyph"><Icon name="shield" size={16} /></span>
              <span className="qcmd-lbl">Escalate</span>
              <span className="qcmd-sub">Hand off to IMAP</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Check-in modal · add personnel ──────────────────────────────── */
const CheckInModal = ({ open, onClose, onCheckIn }) => {
  const [uid, setUid] = useStateICS("");
  const [zone, setZone] = useStateICS("Command Post");
  const [status, setStatus] = useStateICS("in");
  useEffectICS(() => { if (open) { setUid(""); setZone("Command Post"); setStatus("in"); } }, [open]);
  const u = BCM.SEED_USERS.find(x => x.id === uid);
  const submit = () => {
    if (!u) return;
    onCheckIn({
      id: "C-" + Date.now().toString().slice(-6),
      first: u.first, last: u.last, role: u.role, phone: u.mobile,
      zone, status,
      time: new Date().toTimeString().slice(0,5),
    });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Check in personnel"
      subtitle="Log arrival or departure at the incident" width={520}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!uid} onClick={submit}>
          <Icon name="check" size={13} />{status === "in" ? "Check in" : "Check out"}
        </button>
      </>}>
      <div className="field">
        <label htmlFor="ci-u">Person</label>
        <select id="ci-u" className="select" value={uid} onChange={(e) => setUid(e.target.value)}>
          <option value="">Select a contact…</option>
          {BCM.SEED_USERS.map(x => <option key={x.id} value={x.id}>{x.first} {x.last} · {x.role} · {x.bu}</option>)}
        </select>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="ci-z">Zone</label>
          <select id="ci-z" className="select" value={zone} onChange={(e) => setZone(e.target.value)}>
            {["Command Post","Staging Area · A","Planning Room","Logistics Depot","Media Holding","Triage Tent","Field — Sector 2","Field — Sector 3"].map(z =>
              <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Direction</label>
          <div className="ci-toggle">
            <button className="ci-tbtn" data-on={status === "in"} onClick={() => setStatus("in")}>
              <Icon name="check" size={12} />In zone
            </button>
            <button className="ci-tbtn" data-on={status === "out"} onClick={() => setStatus("out")}>
              <Icon name="external" size={12} />Out
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const RegistrationView = ({ checkins, setCheckins }) => {
  const [openModal, setOpenModal] = useStateICS(false);
  const inCnt  = checkins.filter(c => c.status === "in").length;
  const outCnt = checkins.filter(c => c.status === "out").length;
  const toggleStatus = (id) => {
    setCheckins(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "in" ? "out" : "in", time: new Date().toTimeString().slice(0,5) } : c));
  };
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Personnel registration</h2>
        <div className="meta">arrivals at the incident</div>
        <div className="right">
          <span className="chip chip-ok chip-dot">In · {inCnt}</span>
          <span className="chip chip-warn chip-dot">Out · {outCnt}</span>
          <button className="btn btn-primary btn-sm" onClick={() => setOpenModal(true)}>
            <Icon name="plus" size={12} />Check in
          </button>
        </div>
      </div>
      <table className="tbl">
        <thead><tr><th>Time</th><th>Name</th><th>Role</th><th>Zone</th><th>Status</th><th>Phone</th><th></th></tr></thead>
        <tbody>
          {checkins.map(c => (
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
              <td>
                <button className="reg-statusbtn" data-s={c.status} onClick={() => toggleStatus(c.id)} title="Click to toggle">
                  <span className="dot" />{c.status === "in" ? "In zone" : "Out"}
                </button>
              </td>
              <td className="mono">{c.phone}</td>
              <td><button className="iconbtn" onClick={() => toggleStatus(c.id)}><Icon name="edit" size={13} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <CheckInModal open={openModal} onClose={() => setOpenModal(false)} onCheckIn={(row) => setCheckins(prev => [row, ...prev])} />
    </div>
  );
};

/* ── Zone namelist modal ─────────────────────────────────────────── */
const ZoneNamelistModal = ({ zone, checkins, onClose }) => {
  if (!zone) return null;
  const people = checkins.filter(c => c.zone === zone.name);
  return (
    <Modal open={!!zone} onClose={onClose} title={`Zone · ${zone.name}`}
      subtitle={`${zone.in} of ${zone.cap} personnel · ${BCM.STATUS_META[zone.status].label}`} width={560}
      footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}>
      <div className="zone-stats">
        <div><div className="lbl">Capacity</div><div className="val mono">{zone.cap}</div></div>
        <div><div className="lbl">In zone</div><div className="val mono">{zone.in}</div></div>
        <div><div className="lbl">Available</div><div className="val mono">{zone.cap - zone.in}</div></div>
        <div><div className="lbl">Utilization</div><div className="val mono">{Math.round((zone.in/zone.cap)*100)}%</div></div>
      </div>
      <div className="csv-section-title">Personnel in zone</div>
      {people.length === 0 ? (
        <div style={{ padding:20, textAlign:"center", color:"var(--ink-3)", fontSize:12.5 }}>
          No personnel currently checked in to this zone.
        </div>
      ) : (
        <div className="zone-namelist">
          {people.map(p => (
            <div key={p.id} className="zone-name-row">
              <Avatar first={p.first} last={p.last} size={28} />
              <div style={{ flex:"1 1 auto" }}>
                <div style={{ fontWeight:500 }}>{p.first} {p.last}</div>
                <div style={{ fontSize:11, color:"var(--ink-4)" }}>{p.role} · checked in {p.time}</div>
              </div>
              <span className="mono" style={{ fontSize:11, color:"var(--ink-3)" }}>{p.phone}</span>
              <span className={`chip chip-dot ${p.status === "in" ? "chip-ok" : "chip-warn"}`}>{p.status === "in" ? "In" : "Out"}</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

const CheckInOutView = ({ checkins }) => {
  const baseZones = [
    { name:"Command Post",    cap:20, status:"green" },
    { name:"Staging Area · A",cap:60, status:"yellow" },
    { name:"Planning Room",   cap:12, status:"green" },
    { name:"Logistics Depot", cap:30, status:"green" },
    { name:"Media Holding",   cap:10, status:"green" },
    { name:"Triage Tent",     cap:24, status:"yellow" },
    { name:"Field — Sector 2",cap:40, status:"yellow" },
    { name:"Field — Sector 3",cap:40, status:"red" },
  ];
  const zones = baseZones.map(z => ({ ...z, in: checkins.filter(c => c.zone === z.name && c.status === "in").length }));
  const [picked, setPicked] = useStateICS(null);
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Zone control</h2>
        <div className="meta">capacity vs. current headcount · click View to see namelist</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap: 12, padding: 16 }}>
        {zones.map((z, i) => {
          const pct = (z.in / z.cap) * 100;
          const meta = BCM.STATUS_META[z.status];
          return (
            <div key={i} className="zone-card" style={{ borderTop: `3px solid ${meta.color}` }}>
              <div style={{ fontWeight:600, fontSize:13.5, marginBottom: 4 }}>{z.name}</div>
              <div style={{ fontSize: 11, color:"var(--ink-3)" }}>{z.in} of {z.cap} · {z.status === "red" ? "no personnel" : meta.label}</div>
              <div style={{ height: 6, background:"var(--bg-sunk)", borderRadius:99, marginTop: 10, overflow:"hidden" }}>
                <div style={{ width: `${Math.max(pct, 4)}%`, height:"100%", background: meta.color, borderRadius:99 }} />
              </div>
              <button className="btn btn-sm zone-viewbtn" onClick={() => setPicked(z)}>
                <Icon name="users" size={11} />View namelist · {z.in}
              </button>
            </div>
          );
        })}
      </div>
      <ZoneNamelistModal zone={picked} checkins={checkins} onClose={() => setPicked(null)} />
    </div>
  );
};

/* ── TACMAP · interactive radius circle + point-to-point measure ──── */
const TacMapView = ({ incident }) => {
  // Origin in canvas %
  const ORIGIN = { x: 50, y: 55 };
  // 1% of width ≈ 30 metres (illustrative)
  const PX_TO_M = 30;
  const [radius, setRadius]   = useStateICS(8);           // in % of canvas (≈240 m)
  const [tool, setTool]       = useStateICS("radius");    // radius | measure
  const [points, setPoints]   = useStateICS([]);          // for measure tool
  const [hover, setHover]     = useStateICS(null);        // {x,y} when one point placed
  const svgRef = useRefICS(null);

  const radiusMetres = Math.round(radius * PX_TO_M);

  const toLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  const onClick = (e) => {
    if (tool !== "measure") return;
    const p = toLocal(e);
    setPoints(prev => prev.length >= 2 ? [p] : [...prev, p]);
  };

  const onMove = (e) => {
    if (tool !== "measure" || points.length !== 1) return;
    setHover(toLocal(e));
  };

  const segments = useMemoICS(() => {
    const pts = [...points];
    if (pts.length === 1 && hover) pts.push(hover);
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i+1];
      const dx = (b.x - a.x), dy = (b.y - a.y);
      const distPct = Math.sqrt(dx*dx + dy*dy);
      segs.push({ a, b, m: Math.round(distPct * PX_TO_M) });
    }
    return segs;
  }, [points, hover]);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>TACMAP · radius & distance tools</h2>
        <div className="meta">{incident.location_en} · op-period 4</div>
        <div className="right">
          <div className="tac-toolbar">
            <button className="tac-toolbtn" data-on={tool === "radius"} onClick={() => setTool("radius")}>
              <Icon name="map" size={12} />Radius circle
            </button>
            <button className="tac-toolbtn" data-on={tool === "measure"} onClick={() => { setTool("measure"); setPoints([]); }}>
              <Icon name="external" size={12} />Measure
            </button>
          </div>
          <button className="btn btn-sm"><Icon name="external" size={12} />Open in IMAP</button>
        </div>
      </div>

      {/* Tool inspector */}
      <div className="tac-inspector">
        {tool === "radius" ? (
          <>
            <div className="tac-insp-block">
              <div className="lbl">Hot zone radius</div>
              <div className="tac-slider">
                <input type="range" min="2" max="28" step="1" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
                <span className="mono tac-readout">{radiusMetres} m</span>
              </div>
            </div>
            <div className="tac-insp-block">
              <div className="lbl">Coverage</div>
              <div className="mono tac-readout">
                area ≈ {(Math.PI * Math.pow(radiusMetres/1000, 2)).toFixed(3)} km²
              </div>
            </div>
            <div className="tac-insp-block">
              <div className="lbl">Bands</div>
              <div className="tac-bands">
                <span><span className="sw" style={{ background:"#b3261e" }} /> Hot {radiusMetres} m</span>
                <span><span className="sw" style={{ background:"#a85a00" }} /> Warm {radiusMetres*2} m</span>
                <span><span className="sw" style={{ background:"#1d4ed8" }} /> Cold {radiusMetres*3} m</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="tac-insp-block">
              <div className="lbl">Measure tool</div>
              <div style={{ fontSize:12.5, color:"var(--ink-2)" }}>
                {points.length === 0 ? "Click a start point on the map." :
                 points.length === 1 ? "Click an end point to complete the segment." :
                 `Segment length: ${segments[0]?.m} m`}
              </div>
            </div>
            <div className="tac-insp-block">
              <div className="lbl">Total distance</div>
              <div className="mono tac-readout">
                {segments.reduce((s, x) => s + x.m, 0)} m
              </div>
            </div>
            <div className="tac-insp-block">
              <button className="btn btn-sm" onClick={() => { setPoints([]); setHover(null); }}>
                <Icon name="close" size={11} />Clear points
              </button>
            </div>
          </>
        )}
      </div>

      <div className="tac-canvas-wrap" style={{ cursor: tool === "measure" ? "crosshair" : "default" }}>
        <svg ref={svgRef} viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ width:"100%", height: 460, display:"block", background:"radial-gradient(120% 100% at 50% 40%, #eaf0fb 0%, #e1e6f1 70%)" }}
          onClick={onClick} onMouseMove={onMove}>
          {/* grid */}
          <defs>
            <pattern id="tac-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0 L 0 0 0 5" fill="none" stroke="#cbd5e1" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#tac-grid)" />

          {/* radius rings (always visible, faded if tool != radius) */}
          {[1, 2, 3].map(n => (
            <circle key={n} cx={ORIGIN.x} cy={ORIGIN.y} r={radius * n}
              fill="none"
              stroke={n === 1 ? "#b3261e" : n === 2 ? "#a85a00" : "#1d4ed8"}
              strokeWidth={n === 1 ? "0.4" : "0.3"}
              strokeDasharray={n === 1 ? "0" : "1 0.6"}
              opacity={tool === "radius" ? (0.85 - n*0.15) : 0.35}
              vectorEffect="non-scaling-stroke" />
          ))}
          {/* origin */}
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r="0.9" fill="#b3261e" stroke="#fff" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />

          {/* radius spoke + label */}
          {tool === "radius" && (
            <>
              <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x + radius} y2={ORIGIN.y}
                stroke="#b3261e" strokeWidth="0.4" strokeDasharray="0.8 0.6" vectorEffect="non-scaling-stroke" />
            </>
          )}

          {/* measure segments */}
          {tool === "measure" && segments.map((s, i) => (
            <g key={i}>
              <line x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y}
                stroke="#1d4ed8" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
          {tool === "measure" && [...points, ...(points.length === 1 && hover ? [hover] : [])].map((p, i, arr) => (
            <circle key={i} cx={p.x} cy={p.y} r="0.7"
              fill={i === 0 ? "#117a4b" : "#1d4ed8"}
              stroke="#fff" strokeWidth="0.3" vectorEffect="non-scaling-stroke" opacity={i === arr.length - 1 && points.length === 1 ? 0.6 : 1} />
          ))}
        </svg>

        {/* Overlay labels (HTML for crisp text) */}
        {tool === "radius" && (
          <div className="tac-radius-label" style={{ left: `${ORIGIN.x + radius/2}%`, top: `${ORIGIN.y - 2}%` }}>
            r = {radiusMetres} m
          </div>
        )}
        {tool === "measure" && segments.map((s, i) => {
          const mx = (s.a.x + s.b.x) / 2;
          const my = (s.a.y + s.b.y) / 2;
          return (
            <div key={i} className="tac-meas-label" style={{ left: `${mx}%`, top: `${my}%` }}>
              {s.m} m
            </div>
          );
        })}
        {tool === "measure" && points.length === 0 && (
          <div className="tac-hint">Click to place start · then click to place end</div>
        )}
      </div>
    </div>
  );
};

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
  const [checkins, setCheckins] = useStateICS(BCM.ICS_CHECKINS);
  const [modal, setModal] = useStateICS(null);
  const [toast, setToast] = useStateICS(null);

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

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const openModal = (k) => {
    if (k === "tacmap") { setTab("tacmap"); return; }
    if (k === "erp")    { flash("Opening linked emergency plan in Documents Library…"); return; }
    setModal(k);
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

      {tab === "overview" && <OverviewView incident={incident} assignments={assignments} onOpenModal={openModal} />}
      {tab === "chart" && <OrgChart assignments={assignments} onEdit={setEditing} />}
      {tab === "reg" && <RegistrationView checkins={checkins} setCheckins={setCheckins} />}
      {tab === "checkin" && <CheckInOutView checkins={checkins} />}
      {tab === "tacmap" && <TacMapView incident={incident} />}

      <AssignModal
        pos={editing}
        current={editing ? assignments[editing.id] : null}
        onClose={() => setEditing(null)}
        onAssign={assign}
      />

      <CallTreeModal
        open={modal === "calltree"}
        onClose={() => setModal(null)}
        incident={incident}
        onActivate={(r) => flash(`Call tree activated · ${r.count} contacts across ${r.roles.join(", ")}`)}
      />
      <BroadcastAlertModal
        open={modal === "broadcast"}
        onClose={() => setModal(null)}
        incident={incident}
        onBroadcast={(b) => flash(`Alert broadcast to ${b.recipients} via ${b.channels.join(" · ")}`)}
      />
      <SiteMapModal
        open={modal === "sitemap"}
        onClose={() => setModal(null)}
        incident={incident}
      />
      <EscalateModal
        open={modal === "escalate"}
        onClose={() => setModal(null)}
        incident={incident}
        onEscalate={() => flash("Incident escalated to IMAP · case sync in progress")}
      />

      {toast && (
        <div className="toast"><Icon name="check" size={14} />{toast}</div>
      )}
    </div>
  );
};

window.IncidentCommand = IncidentCommand;
