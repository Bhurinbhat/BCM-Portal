// roster.jsx — Yearly/Monthly/Weekly roster + Swap requests for User Management

/* ── PDF helpers ───────────────────────────────────────────────── */
const buildRosterPDF = (title, subtitle, rows, columns) => {
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  let content = `BT /F1 16 Tf 50 770 Td (${esc(title)}) Tj ET\n`;
  content    += `BT /F1 10 Tf 50 752 Td (${esc(subtitle)}) Tj ET\n`;
  content    += `BT /F1 8 Tf 50 738 Td (Generated 2026-05-15 17:30 ICT \u2014 BCM Portal) Tj ET\n`;

  let y = 712;
  // header row
  let x = 50;
  columns.forEach((c) => {
    content += `BT /F1 9.5 Tf ${x} ${y} Td (${esc(c.label)}) Tj ET\n`;
    x += c.w;
  });
  y -= 6;
  content += `0.6 0.6 0.6 RG 0.5 w 50 ${y} m 560 ${y} l S\n`;
  y -= 12;

  rows.forEach((r, i) => {
    if (y < 60) return;
    // zebra
    if (i % 2 === 0) {
      content += `0.965 0.97 0.98 rg 50 ${y - 2} 510 14 re f\n`;
      content += `0 0 0 rg\n`;
    }
    let cx = 50;
    columns.forEach((c) => {
      const v = r[c.key] == null ? "" : String(r[c.key]);
      // simple truncation by char count
      const max = Math.max(4, Math.floor(c.w / 5.4));
      const v2 = v.length > max ? v.slice(0, max - 1) + "\u2026" : v;
      content += `BT /F1 9 Tf ${cx} ${y} Td (${esc(v2)}) Tj ET\n`;
      cx += c.w;
    });
    y -= 14;
  });

  const objs = [];
  const push = (s) => { objs.push(s); return objs.length; };
  push("<< /Type /Catalog /Pages 2 0 R >>");
  push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>");
  push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offs = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i+1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;
  offs.forEach(o => { pdf += String(o).padStart(10, "0") + " 00000 n \n"; });
  pdf += `trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
};

const downloadRosterPDF = (filename, pdf) => {
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
};

/* ── Deterministic roster generator ─────────────────────────────── */
// Pseudo-random but stable selection of 1st / 2nd person per ICS function per period.
const pickUsersForFn = (fnId, periodKey) => {
  const users = BCM.SEED_USERS;
  // Filter pool by likely roles: CMC for IC/SO/LO/PIO; BMT/LMT for sections
  const isCommand = ["IC", "SO", "LO", "PIO"].includes(fnId);
  const pool = users.filter(u => isCommand
    ? (u.role === "CMC" || u.role === "BMT")
    : (u.role === "BMT" || u.role === "LMT"));
  const hash = (s) => { let h = 0; for (const c of s) h = ((h << 5) - h + c.charCodeAt(0)) | 0; return Math.abs(h); };
  const seed = hash(fnId + "::" + periodKey);
  const a = pool[seed % pool.length];
  const b = pool[(seed * 7 + 3) % pool.length];
  const second = b.id === a.id ? pool[(seed * 7 + 4) % pool.length] : b;
  return { first: a, second };
};

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtPeriod = (period, idx) => {
  if (period === "yearly")  return `Year ${2026}`;
  if (period === "monthly") return `${monthNames[idx]} 2026`;
  if (period === "weekly")  return `Week ${idx + 1}, 2026`;
  return "";
};
const periodKey = (period, idx) => `${period}-2026-${idx}`;
const periodRange = (period, idx) => {
  if (period === "yearly")  return "Jan 01 → Dec 31";
  if (period === "monthly") {
    const last = new Date(2026, idx + 1, 0).getDate();
    return `${monthNames[idx]} 01 → ${monthNames[idx]} ${last}`;
  }
  if (period === "weekly") {
    // Approximate week ranges
    const start = idx * 7 + 1;
    const end = Math.min(start + 6, 365);
    const d1 = new Date(2026, 0, start);
    const d2 = new Date(2026, 0, end);
    return `${monthNames[d1.getMonth()]} ${d1.getDate()} → ${monthNames[d2.getMonth()]} ${d2.getDate()}`;
  }
  return "";
};

/* ── Roster panel ──────────────────────────────────────────────── */
const RosterPanel = () => {
  const [period, setPeriod]   = useState("monthly");
  const [periodIdx, setIdx]   = useState(4); // May (0-indexed) for monthly default
  const [toast, setToast]     = useState(null);

  // Build the roster for the active period
  const rows = BCM.ICS_POSITIONS.map(pos => {
    const { first, second } = pickUsersForFn(pos.id, periodKey(period, periodIdx));
    return { pos, first, second };
  });

  const exportPDF = () => {
    const label = fmtPeriod(period, periodIdx);
    const subtitle = `${period[0].toUpperCase() + period.slice(1)} roster · ${label} · ${periodRange(period, periodIdx)}`;
    const cols = [
      { key:"fn",     label:"ICS Function",  w: 170 },
      { key:"first",  label:"1st Person",     w: 170 },
      { key:"first_phone", label:"Mobile",    w: 80  },
      { key:"second", label:"2nd Person",     w: 170 },
    ];
    const pdfRows = rows.map(r => ({
      fn:           `${r.pos.id} \u2013 ${r.pos.label}`,
      first:        `${r.first.first} ${r.first.last}`,
      first_phone:  r.first.mobile,
      second:       `${r.second.first} ${r.second.last}`,
    }));
    const pdf = buildRosterPDF(`BCM On-Call Roster`, subtitle, pdfRows, cols);
    const filename = `BCM_Roster_${period}_${label.replace(/\s+/g,"_")}.pdf`;
    downloadRosterPDF(filename, pdf);
    setToast({ kind:"pdf", filename });
    setTimeout(() => setToast(null), 4000);
  };

  // Period selector options
  const idxRange = period === "yearly" ? [0]
                : period === "monthly" ? Array.from({length: 12}, (_, i) => i)
                : Array.from({length: 52}, (_, i) => i);

  return (
    <div>
      <div className="panel">
        <div className="panel-head">
          <h2>On-call roster <span className="meta" style={{ marginLeft: 6, color:"var(--ink-4)", fontSize:11 }}>· 1st &amp; 2nd person per ICS function</span></h2>
          <div className="right">
            <button className="btn" onClick={exportPDF}>
              <Icon name="download" size={13} />View / Download PDF
            </button>
          </div>
        </div>

        {/* Period controls */}
        <div className="roster-controls">
          <div className="roster-period-seg" role="tablist" aria-label="Roster period">
            {["yearly","monthly","weekly"].map(p => (
              <button key={p} role="tab"
                aria-current={period === p ? "page" : undefined}
                onClick={() => { setPeriod(p); setIdx(p === "yearly" ? 0 : p === "monthly" ? 4 : 19); }}>
                {p[0].toUpperCase() + p.slice(1)} roster
              </button>
            ))}
          </div>

          {period !== "yearly" && (
            <div className="roster-idx">
              <button className="iconbtn" onClick={() => setIdx(Math.max(0, periodIdx - 1))} aria-label="Previous">
                <Icon name="external" size={11} stroke={2} />
              </button>
              <select className="select" style={{ minWidth: 220 }}
                value={periodIdx}
                onChange={e => setIdx(Number(e.target.value))}>
                {idxRange.map(i => (
                  <option key={i} value={i}>{fmtPeriod(period, i)} · {periodRange(period, i)}</option>
                ))}
              </select>
              <button className="iconbtn" onClick={() => setIdx(Math.min(idxRange.length - 1, periodIdx + 1))} aria-label="Next">
                <Icon name="external" size={11} stroke={2} />
              </button>
            </div>
          )}

          <span className="roster-period-tag mono">
            {fmtPeriod(period, periodIdx)} · {periodRange(period, periodIdx)}
          </span>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table className="tbl roster-tbl">
            <thead>
              <tr>
                <th style={{ width: 230 }}>ICS Function</th>
                <th>1st Person <span className="th-sub">primary on-call</span></th>
                <th>2nd Person <span className="th-sub">backup on-call</span></th>
                <th style={{ width: 110, textAlign:"right" }}>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ pos, first, second }) => (
                <tr key={pos.id}>
                  <td>
                    <div className="roster-fn">
                      <span className={`roster-fn-tag tone-${pos.tone}`}>{pos.id}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{pos.label}</div>
                        <div className="roster-fn-sub">{pos.units?.[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="roster-person">
                      <Avatar first={first.first} last={first.last} size={28} />
                      <div className="roster-person-text">
                        <span className="roster-person-name">
                          {first.first} {first.last}
                          <span className={`role role-${first.role}`} style={{ marginLeft: 6 }}>{first.role}</span>
                        </span>
                        <span className="roster-person-sub mono">{first.mobile} · {first.bu}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="roster-person">
                      <Avatar first={second.first} last={second.last} size={28} />
                      <div className="roster-person-text">
                        <span className="roster-person-name">
                          {second.first} {second.last}
                          <span className={`role role-${second.role}`} style={{ marginLeft: 6 }}>{second.role}</span>
                        </span>
                        <span className="roster-person-sub mono">{second.mobile} · {second.bu}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="chip chip-ok chip-dot">Confirmed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="roster-footnote">
          <span>{rows.length} ICS functions · {rows.length * 2} on-call slots</span>
          <span className="mono" style={{ color:"var(--ink-4)" }}>auto-generated · approved by CMC Office</span>
        </div>
      </div>

      {toast && (
        <div className="csv-toast" role="status">
          <Icon name="download" size={14} />
          PDF ready · <span className="mono">{toast.filename}</span>
        </div>
      )}
    </div>
  );
};

/* ── Swap Requests panel ──────────────────────────────────────────── */
const SWAP_SEED = [
  { id:"SW-2026-014", date:"2026-05-18", fn:"OPS",  fnLabel:"Operations",   period:"Weekly · W 21",   requestedBy:"U-1010", swapBy:"U-1009", reason:"Personal leave", status:"pending"  },
  { id:"SW-2026-013", date:"2026-05-15", fn:"PIO",  fnLabel:"Public Info",  period:"Monthly · May 2026", requestedBy:"U-1007", swapBy:"U-1011", reason:"Conflicting drill", status:"approved" },
  { id:"SW-2026-012", date:"2026-05-12", fn:"LOG",  fnLabel:"Logistics",    period:"Weekly · W 20",   requestedBy:"U-1002", swapBy:"U-1004", reason:"Medical appointment", status:"approved" },
  { id:"SW-2026-011", date:"2026-05-08", fn:"SO",   fnLabel:"Safety",       period:"Weekly · W 19",   requestedBy:"U-1009", swapBy:"U-1006", reason:"Site audit clash", status:"pending"  },
  { id:"SW-2026-010", date:"2026-05-04", fn:"PLAN", fnLabel:"Planning",     period:"Monthly · May 2026", requestedBy:"U-1001", swapBy:"U-1007", reason:"Family", status:"declined" },
  { id:"SW-2026-009", date:"2026-04-29", fn:"FIN",  fnLabel:"Finance/Admin",period:"Weekly · W 18",   requestedBy:"U-1004", swapBy:"U-1009", reason:"Audit week", status:"approved" },
];

const statusChip = (s) => {
  if (s === "approved") return <span className="chip chip-ok chip-dot">Approved</span>;
  if (s === "pending")  return <span className="chip chip-warn chip-dot">Pending</span>;
  if (s === "declined") return <span className="chip chip-danger chip-dot">Declined</span>;
  return <span className="chip">{s}</span>;
};

const SwapRequestModal = ({ open, onClose, onCreate }) => {
  const [fn, setFn]   = useState("OPS");
  const [requested, setRequested] = useState(BCM.SEED_USERS[0]?.id || "");
  const [swap, setSwap] = useState(BCM.SEED_USERS[1]?.id || "");
  const [period, setPeriod] = useState("weekly");
  const [periodLabel, setPeriodLabel] = useState("Week 21, 2026");
  const [reason, setReason] = useState("");

  React.useEffect(() => {
    if (open) {
      setFn("OPS");
      setRequested(BCM.SEED_USERS[0]?.id || "");
      setSwap(BCM.SEED_USERS[1]?.id || "");
      setPeriod("weekly");
      setPeriodLabel("Week 21, 2026");
      setReason("");
    }
  }, [open]);

  const valid = fn && requested && swap && requested !== swap && periodLabel.trim();

  const submit = () => {
    if (!valid) return;
    const pos = BCM.ICS_POSITIONS.find(p => p.id === fn);
    onCreate({
      id: "SW-2026-" + String(Math.floor(Math.random() * 900) + 100),
      date: "2026-05-19",
      fn,
      fnLabel: pos?.label || fn,
      period: `${period[0].toUpperCase() + period.slice(1)} · ${periodLabel}`,
      requestedBy: requested,
      swapBy: swap,
      reason: reason || "—",
      status: "pending",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a swap"
      subtitle="Hand off your on-call shift to another contact."
      width={560}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!valid} onClick={submit}>
          <Icon name="check" size={13} />Submit request
        </button>
      </>}
    >
      <div className="grid-2">
        <div className="field">
          <label htmlFor="sw-fn">ICS function</label>
          <select id="sw-fn" className="select" value={fn} onChange={e => setFn(e.target.value)}>
            {BCM.ICS_POSITIONS.map(p => <option key={p.id} value={p.id}>{p.id} — {p.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sw-period">Period</label>
          <select id="sw-period" className="select" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="sw-label">Period label</label>
        <input id="sw-label" className="input" value={periodLabel} onChange={e => setPeriodLabel(e.target.value)} placeholder="e.g. Week 21, 2026" />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="sw-from">Requested by</label>
          <select id="sw-from" className="select" value={requested} onChange={e => setRequested(e.target.value)}>
            {BCM.SEED_USERS.map(u => <option key={u.id} value={u.id}>{u.first} {u.last} · {u.role}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sw-to">Swap by</label>
          <select id="sw-to" className="select" value={swap} onChange={e => setSwap(e.target.value)}>
            {BCM.SEED_USERS.map(u => <option key={u.id} value={u.id} disabled={u.id === requested}>{u.first} {u.last} · {u.role}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="sw-reason">Reason</label>
        <textarea id="sw-reason" className="input" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Brief reason for the swap." />
      </div>
    </Modal>
  );
};

const SwapPanel = () => {
  const [swaps, setSwaps] = useState(SWAP_SEED);
  const [opening, setOpening] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const visible = filter === "ALL" ? swaps : swaps.filter(s => s.status === filter);

  const userOf = (id) => BCM.SEED_USERS.find(u => u.id === id);

  const setStatus = (id, status) => {
    setSwaps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const exportPDF = () => {
    const cols = [
      { key:"id",          label:"Request",       w: 80 },
      { key:"date",        label:"Date",          w: 60 },
      { key:"fn",          label:"ICS Fn",        w: 50 },
      { key:"period",      label:"Period",        w: 110 },
      { key:"requestedBy", label:"Requested By",  w: 130 },
      { key:"swapBy",      label:"Swap By",       w: 130 },
      { key:"status",      label:"Status",        w: 60 },
    ];
    const pdfRows = visible.map(s => {
      const a = userOf(s.requestedBy);
      const b = userOf(s.swapBy);
      return {
        id: s.id,
        date: s.date,
        fn: s.fn,
        period: s.period,
        requestedBy: a ? `${a.first} ${a.last}` : s.requestedBy,
        swapBy:      b ? `${b.first} ${b.last}` : s.swapBy,
        status: s.status[0].toUpperCase() + s.status.slice(1),
      };
    });
    const pdf = buildRosterPDF(
      "BCM Swap Requests",
      `Filter: ${filter === "ALL" ? "all statuses" : filter} · ${visible.length} request${visible.length === 1 ? "" : "s"}`,
      pdfRows, cols
    );
    const filename = `BCM_Swap_Requests_${filter}.pdf`;
    downloadRosterPDF(filename, pdf);
    setToast({ filename });
    setTimeout(() => setToast(null), 4000);
  };

  const counts = {
    ALL:      swaps.length,
    pending:  swaps.filter(s => s.status === "pending").length,
    approved: swaps.filter(s => s.status === "approved").length,
    declined: swaps.filter(s => s.status === "declined").length,
  };

  return (
    <div>
      <div className="panel">
        <div className="panel-head">
          <h2>Swap requests <span className="meta" style={{ marginLeft: 6, color:"var(--ink-4)", fontSize:11 }}>· hand-off log between on-call contacts</span></h2>
          <div className="right">
            <button className="btn" onClick={exportPDF}>
              <Icon name="download" size={13} />View / Download PDF
            </button>
            <button className="btn btn-primary" onClick={() => setOpening(true)}>
              <Icon name="plus" size={13} />Request swap
            </button>
          </div>
        </div>

        <div className="swap-filters">
          {[
            { id:"ALL",      label:"All requests" },
            { id:"pending",  label:"Pending" },
            { id:"approved", label:"Approved" },
            { id:"declined", label:"Declined" },
          ].map(f => (
            <button key={f.id} className="swap-filter"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="count mono">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        <div style={{ overflowX:"auto" }}>
          <table className="tbl swap-tbl">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Request</th>
                <th style={{ width: 100 }}>ICS Function</th>
                <th style={{ width: 170 }}>Period</th>
                <th>Requested By</th>
                <th>Swap By</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 120, textAlign:"right" }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => {
                const a = userOf(s.requestedBy);
                const b = userOf(s.swapBy);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:"flex", flexDirection:"column", lineHeight: 1.2 }}>
                        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{s.id}</span>
                        <span className="mono" style={{ fontSize: 10.5, color:"var(--ink-4)" }}>{s.date}</span>
                      </div>
                    </td>
                    <td>
                      <span className="chip chip-mono">{s.fn}</span>
                      <span style={{ marginLeft: 6, fontSize: 11.5, color:"var(--ink-3)" }}>{s.fnLabel}</span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{s.period}</td>
                    <td>
                      {a ? (
                        <div className="swap-person">
                          <Avatar first={a.first} last={a.last} size={26} />
                          <div className="swap-person-text">
                            <span className="swap-person-name">{a.first} {a.last}</span>
                            <span className="swap-person-sub mono">{a.role} · {a.mobile}</span>
                          </div>
                        </div>
                      ) : <span style={{ color:"var(--ink-4)" }}>—</span>}
                    </td>
                    <td>
                      {b ? (
                        <div className="swap-person">
                          <Avatar first={b.first} last={b.last} size={26} />
                          <div className="swap-person-text">
                            <span className="swap-person-name">{b.first} {b.last}</span>
                            <span className="swap-person-sub mono">{b.role} · {b.mobile}</span>
                          </div>
                        </div>
                      ) : <span style={{ color:"var(--ink-4)" }}>—</span>}
                    </td>
                    <td>{statusChip(s.status)}</td>
                    <td style={{ textAlign:"right" }}>
                      {s.status === "pending" ? (
                        <div style={{ display:"inline-flex", gap: 4 }}>
                          <button className="iconbtn ine-save" title="Approve" onClick={() => setStatus(s.id, "approved")}><Icon name="check" size={13} /></button>
                          <button className="iconbtn ine-cancel" title="Decline" onClick={() => setStatus(s.id, "declined")}><Icon name="close" size={13} /></button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color:"var(--ink-4)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty"><b>No swap requests match</b>Try clearing the filter, or submit a new request.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="roster-footnote">
          <span>{visible.length} request{visible.length === 1 ? "" : "s"}</span>
          <span className="mono" style={{ color:"var(--ink-4)" }}>swap log · retained 12 months</span>
        </div>
      </div>

      <SwapRequestModal
        open={opening}
        onClose={() => setOpening(false)}
        onCreate={(rec) => setSwaps(prev => [rec, ...prev])}
      />

      {toast && (
        <div className="csv-toast" role="status">
          <Icon name="download" size={14} />
          PDF ready · <span className="mono">{toast.filename}</span>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { RosterPanel, SwapPanel });
