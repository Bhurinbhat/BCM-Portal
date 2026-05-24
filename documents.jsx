// documents.jsx — Documents Library (BU dashboard + library view)

const { useState: useStateDL, useMemo: useMemoDL, useRef: useRefDL, useEffect: useEffectDL } = React;

const DOC_KINDS = [
  { kind:"POL", label:"Policy",                              short:"Policy",        color:"#7a4a00" },
  { kind:"EMP", label:"Emergency Plan (ER)",                 short:"Emergency",     color:"#b3261e" },
  { kind:"BCP", label:"Business Continuity Management (BCP)",short:"BCM (BCP)",     color:"#1e40af" },
];

const DOC_CLASSIFICATIONS = ["Internal", "Restricted", "Confidential"];
const ACCEPTED_EXT = ["pdf","docx","doc","xlsx","xls","pptx","ppt"];
const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB

const fmtFileSize = (b) =>
  b < 1024 ? `${b} B`
  : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB`
  : `${(b / 1024 / 1024).toFixed(1)} MB`;

const extOf = (name) => (name.split(".").pop() || "").toLowerCase();

const docKey = (d) => d.id || `${d.bu}::${d.title}`;

const todayISO = () => "2026-05-15"; // demo "today"

/* ── Minimal PDF generator — produces a tiny but real PDF blob ────── */
const buildStubPDF = (doc) => {
  const lines = [
    "BCM Portal",
    "",
    `Title: ${doc.title}`,
    `Business unit: ${BCM.BU_META[doc.bu]?.name || doc.bu}`,
    `Type: ${doc.kind}`,
    `Version: ${doc.version}\u00A0\u00A0\u00A0\u00A0Classification: ${doc.classification}`,
    `Owner: ${doc.owner}\u00A0\u00A0\u00A0\u00A0Updated: ${doc.updated}`,
    "",
    `${doc.desc || ""}`,
    "",
    "--- Revision history ---",
    ...(doc.revisions || []).map(r => `${r.v}  ${r.date}  ${r.note}`),
    "",
    "This document is a placeholder stub. The full document is stored in the",
    "document management system. Generated from BCM Portal demo.",
  ];

  // Escape parentheses and backslashes for PDF strings
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  // Build content stream: position lines top-down on a Letter-size page
  const startY = 740;
  const lineH = 16;
  let content = "BT /F1 14 Tf 60 760 Td (BCM Portal \u2014 Document export) Tj ET\n";
  content += "BT /F1 10 Tf 60 745 Td (Generated 2026-05-15) Tj ET\n";
  lines.forEach((ln, i) => {
    const y = startY - 20 - (i + 1) * lineH;
    if (y < 60) return;
    content += `BT /F1 ${i === 0 ? 13 : 10} Tf 60 ${y} Td (${esc(ln)}) Tj ET\n`;
  });

  const objects = [];
  const push = (s) => { objects.push(s); return objects.length; };
  push("<< /Type /Catalog /Pages 2 0 R >>");
  push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>");
  push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach(o => { pdf += String(o).padStart(10, "0") + " 00000 n \n"; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

const downloadDocPDF = (doc) => {
  const pdf = buildStubPDF(doc);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const safeTitle = (doc.title || "document").replace(/[^a-z0-9\-\s]/gi, "").trim().replace(/\s+/g, "_");
  const filename = `${safeTitle}_${(doc.version || "v1").replace(/\s+/g,"")}.pdf`;
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
  return filename;
};

/* ── Upload modal · attach a file + metadata ─────────────────────── */
const UploadDocModal = ({ open, onClose, onUpload, mode = "new", revisionFor = null }) => {
  const [file, setFile]   = useStateDL(null);
  const [error, setError] = useStateDL("");
  const [dragOver, setDragOver] = useStateDL(false);
  const [meta, setMeta] = useStateDL({
    title: "", bu: "", kind: "BCP",
    classification: "Internal", version: "v1.0",
    desc: "", note: "",
    uploadBy: "You · CMC",
  });
  const fileInput = useRefDL(null);

  useEffectDL(() => {
    if (!open) { setFile(null); setError(""); setDragOver(false); return; }
    if (mode === "revision" && revisionFor) {
      const m = /^v(\d+)\.(\d+)$/i.exec(revisionFor.version || "v1.0");
      const next = m ? `v${m[1]}.${Number(m[2]) + 1}` : "v1.1";
      setMeta({
        title: revisionFor.title, bu: revisionFor.bu, kind: revisionFor.kind,
        classification: revisionFor.classification, version: next,
        desc: revisionFor.desc, note: "",
        uploadBy: "You · CMC",
      });
    } else {
      setMeta({ title:"", bu:"", kind:"BCP", classification:"Internal", version:"v1.0", desc:"", note:"", uploadBy:"You · CMC" });
    }
  }, [open, mode, revisionFor]);

  const acceptFile = (f) => {
    setError("");
    if (!f) return;
    const ext = extOf(f.name);
    if (!ACCEPTED_EXT.includes(ext)) {
      setError(`Unsupported file type · .${ext}. Accepts: ${ACCEPTED_EXT.map(x => "."+x).join(", ")}`);
      return;
    }
    if (f.size > MAX_DOC_BYTES) {
      setError(`File is ${fmtFileSize(f.size)} — over the ${fmtFileSize(MAX_DOC_BYTES)} limit.`);
      return;
    }
    setFile(f);
    if (mode === "new" && !meta.title) {
      const stem = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setMeta(m => ({ ...m, title: stem.charAt(0).toUpperCase() + stem.slice(1) }));
    }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) acceptFile(f);
  };

  const formValid = !!file && (mode === "revision"
    ? !!meta.note.trim()
    : meta.title.trim() && meta.bu && meta.kind && meta.version.trim());

  const submit = () => {
    if (!formValid) return;
    onUpload({ ...meta, file, mode, revisionFor: revisionFor ? docKey(revisionFor) : null });
    onClose();
  };

  const headerTitle = mode === "revision"
    ? `Upload revision · ${revisionFor?.title || ""}`
    : "Upload document";
  const headerSub = mode === "revision"
    ? `Replace the active file for ${revisionFor?.version} — metadata is locked.`
    : "Attach a PDF, Word, Excel or PowerPoint file, then fill in the catalog details.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={headerTitle}
      subtitle={headerSub}
      width={760}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!formValid} onClick={submit}>
          <Icon name="upload" size={13} />
          {mode === "revision" ? "Upload revision" : "Upload document"}
        </button>
      </>}
    >
      {!file && (
        <div
          className={`csv-drop${dragOver ? " over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInput.current?.click()}
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInput.current?.click(); }}
        >
          <div className="csv-drop-icon"><Icon name="upload" size={26} stroke={1.6} /></div>
          <div className="csv-drop-title">Drop a document here, or <span className="lnk">browse</span></div>
          <div className="csv-drop-hint">PDF, Word, Excel, PowerPoint · up to {fmtFileSize(MAX_DOC_BYTES)}</div>
          <input ref={fileInput} type="file"
            accept={ACCEPTED_EXT.map(e => "."+e).join(",")}
            style={{ display:"none" }}
            onChange={(e) => acceptFile(e.target.files?.[0])} />
          <div className="csv-drop-cols">
            <span>Accepted:</span>
            {ACCEPTED_EXT.map(x => <code key={x}>.{x}</code>)}
          </div>
        </div>
      )}

      {error && <div className="csv-error"><Icon name="shield" size={13} />{error}</div>}

      {file && (
        <>
          <div className="csv-filecard">
            <div className="csv-filecard-icon" data-ext={extOf(file.name)}>
              <span className="upload-ext">{extOf(file.name).toUpperCase()}</span>
            </div>
            <div style={{ flex:"1 1 auto", minWidth:0 }}>
              <div className="csv-filecard-name">{file.name}</div>
              <div className="csv-filecard-meta">{fmtFileSize(file.size)} · {file.type || "application/octet-stream"}</div>
            </div>
            <button className="btn btn-sm" onClick={() => setFile(null)}>
              <Icon name="close" size={12} />Replace
            </button>
          </div>

          {mode === "revision" ? (
            <>
              <div className="csv-section-title">Revision note</div>
              <div className="field">
                <label htmlFor="up-note">What changed in this version?</label>
                <textarea id="up-note" className="input" rows={3}
                  placeholder="e.g. Updated muster-point coordinates after the Q2 drill; added section 4.3."
                  value={meta.note} onChange={(e) => setMeta({ ...meta, note: e.target.value })} />
              </div>
              <div className="upload-bumprow">
                <span>New version</span>
                <input className="input mono" style={{ width:120 }}
                  value={meta.version} onChange={(e) => setMeta({ ...meta, version: e.target.value })} />
                <span className="upload-bumpprev">replaces <b className="mono">{revisionFor?.version}</b></span>
              </div>
            </>
          ) : (
            <>
              <div className="csv-section-title">Document details</div>
              <div className="field">
                <label htmlFor="up-title">Title</label>
                <input id="up-title" className="input"
                  placeholder="e.g. SCGP · Site Emergency Plan — Wangsala"
                  value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
              </div>
              <div className="csv-section-title" style={{ marginTop:8 }}>Type of document</div>
              <div className="doc-kindpicker">
                {DOC_KINDS.map(k => (
                  <button key={k.kind} type="button"
                    className="doc-kindcard" data-on={meta.kind === k.kind}
                    onClick={() => setMeta({ ...meta, kind: k.kind })}
                    style={meta.kind === k.kind ? { borderColor: k.color, background: k.color + "10" } : null}>
                    <span className="doc-kindcard-glyph" style={{ background: k.color, color:"#fff" }}>
                      <Icon name={k.kind === "POL" ? "shield" : k.kind === "EMP" ? "bell" : "docs"} size={14} />
                    </span>
                    <span className="doc-kindcard-name">{k.label}</span>
                    <span className="doc-kindcard-code mono">{k.kind}</span>
                  </button>
                ))}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="up-bu">Business unit</label>
                  <select id="up-bu" className="select"
                    value={meta.bu} onChange={(e) => setMeta({ ...meta, bu: e.target.value })}>
                    <option value="">Select…</option>
                    {BCM.BUSINESS_UNITS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="up-by">Upload by</label>
                  <input id="up-by" className="input"
                    placeholder="Name · Role"
                    value={meta.uploadBy} onChange={(e) => setMeta({ ...meta, uploadBy: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="up-class">Classification</label>
                  <select id="up-class" className="select"
                    value={meta.classification}
                    onChange={(e) => setMeta({ ...meta, classification: e.target.value })}>
                    {DOC_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="up-ver">Version</label>
                  <input id="up-ver" className="input mono" placeholder="v1.0"
                    value={meta.version} onChange={(e) => setMeta({ ...meta, version: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="up-desc">Description</label>
                <textarea id="up-desc" className="input" rows={2}
                  placeholder="One-liner so people know what they're opening."
                  value={meta.desc} onChange={(e) => setMeta({ ...meta, desc: e.target.value })} />
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
};

/* ── Card for individual documents in the library list ───────────── */
const DocCard = ({ doc, onOpen, onRevise, onDownload }) => {
  const bu = BCM.BU_META[doc.bu];
  return (
    <div className="doc-card">
      <div style={{ display:"flex", gap:14 }}>
        <div className="doc-icon" data-kind={doc.kind}><span>{doc.kind}</span></div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
            <span className="chip chip-mono" style={{ background:bu?.soft, color:bu?.color, borderColor:"transparent" }}>{bu?.abbr}</span>
            <span className={`chip ${doc.classification === "Restricted" ? "chip-warn" : doc.classification === "Confidential" ? "chip-danger" : ""}`}>{doc.classification}</span>
          </div>
          <h3>{doc.title}</h3>
          <div className="doc-meta" style={{ marginTop:6 }}>
            <span className="chip chip-mono">{doc.version}</span>
            <span className="sep" />
            <span>{doc.owner}</span>
          </div>
        </div>
      </div>

      <div className="desc">{doc.desc}</div>

      <div className="doc-meta">
        <span>Updated <b className="mono" style={{ color:"var(--ink-2)" }}>{doc.updated}</b></span>
        <span className="sep" />
        <span>{doc.pages} pages</span>
        <span className="sep" />
        <span className="mono">{doc.size}</span>
      </div>

      <div className="doc-row">
        <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onOpen(doc)}>
          <Icon name="docs" size={13} />Open
        </button>
        <button className="btn" onClick={() => onDownload(doc)}><Icon name="download" size={13} />PDF</button>
        <button className="btn btn-icon" title="Upload revision" onClick={() => onRevise(doc)}><Icon name="upload" size={13} /></button>
      </div>
    </div>
  );
};

/* ── Modal viewer ────────────────────────────────────────────────── */
const DocViewer = ({ doc, onClose, onRevise, onDownload }) => {
  const bu = doc && BCM.BU_META[doc.bu];
  return (
    <Modal
      open={!!doc}
      onClose={onClose}
      width={720}
      title={doc?.title}
      subtitle={doc ? `${bu?.abbr} · ${doc.version} · ${doc.owner} · updated ${doc.updated}` : ""}
      footer={<>
        <button className="btn" onClick={() => onDownload(doc)}><Icon name="download" size={13} />Download PDF</button>
        <button className="btn" onClick={() => onRevise(doc)}><Icon name="upload" size={13} />Upload revision</button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </>}
    >
      {doc && (
        <>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div className="doc-icon" data-kind={doc.kind} style={{ width:48, height:58 }}><span>{doc.kind}</span></div>
            <div style={{ flex:1 }}>
              <div className="doc-meta">
                <span className="chip chip-mono" style={{ background:bu?.soft, color:bu?.color, borderColor:"transparent" }}>{bu?.abbr}</span>
                <span className="chip chip-mono">{doc.version}</span>
                <span className={`chip ${doc.classification === "Restricted" ? "chip-warn" : doc.classification === "Confidential" ? "chip-danger" : ""}`}>{doc.classification}</span>
                <span className="sep" />
                <span>{doc.pages} pages</span>
                <span className="sep" />
                <span className="mono">{doc.size}</span>
              </div>
              <div style={{ color:"var(--ink-2)", fontSize:13, marginTop:8 }}>{doc.desc}</div>
            </div>
          </div>

          <div className="divider" />

          <div style={{ fontSize:11, color:"var(--ink-3)", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>Revision history</div>
          <div style={{ border:"1px solid var(--line)", borderRadius:8, overflow:"hidden" }}>
            {doc.revisions.map((r, i) => (
              <div key={r.v} style={{
                display:"flex", alignItems:"center", gap:12, padding:"10px 12px",
                borderBottom: i < doc.revisions.length - 1 ? "1px solid var(--line)" : "0",
                background: i === 0 ? "var(--accent-soft)" : "var(--bg-panel)",
              }}>
                <span className="chip chip-mono" style={{ minWidth:46, justifyContent:"center" }}>{r.v}</span>
                <span className="mono" style={{ color:"var(--ink-3)", fontSize:11.5, width:90 }}>{r.date}</span>
                <span style={{ color:"var(--ink-2)", fontSize:12.5, flex:1 }}>{r.note}</span>
                {i === 0 && <span className="chip chip-ok chip-dot">Current</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

/* ── BU dashboard cards (clickable; cycles to filter on the library list) ─ */
const BUCard = ({ bu, docs, active, onClick }) => {
  const meta = BCM.BU_META[bu];
  const byKind = {
    POL: docs.filter(d => d.kind === "POL").length,
    EMP: docs.filter(d => d.kind === "EMP").length,
    BCP: docs.filter(d => d.kind === "BCP").length,
  };
  // freshness: how many docs updated within last 90 days
  const today = new Date("2026-05-15");
  const fresh = docs.filter(d => {
    const dt = new Date(d.updated);
    return (today - dt) / (1000*60*60*24) <= 120;
  }).length;
  const pct = docs.length ? Math.round((fresh / docs.length) * 100) : 0;

  return (
    <div className="bu-card"
      aria-pressed={active}
      onClick={onClick}
      style={{ "--bu-color": meta.color, "--bu-soft": meta.soft }}>
      <div className="top">
        <span className="abbr">{meta.abbr}</span>
        <h3>{meta.name}</h3>
      </div>
      <div className="desc">{docs.length} documents · {fresh} fresh in 120d</div>
      <div className="row">
        <div>
          <div className="num">{docs.length}</div>
          <div className="lbl">documents</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div className="num" style={{ color: meta.color }}>{pct}<span style={{ fontSize:14, color:"var(--ink-4)" }}>%</span></div>
          <div className="lbl">freshness</div>
        </div>
      </div>
      <div className="kindrow">
        <span className="chip">POL · {byKind.POL}</span>
        <span className="chip">EMP · {byKind.EMP}</span>
        <span className="chip">BCP · {byKind.BCP}</span>
      </div>
      <div className="freshbar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
};

/* ── Dashboard sub-view ──────────────────────────────────────────── */
/* ── Type visualization panel · donut + per-BU bars ─────────────── */
const DocsTypeViz = ({ docs }) => {
  const totals = DOC_KINDS.map(k => ({
    ...k,
    count: docs.filter(d => d.kind === k.kind).length,
  }));
  const total = docs.length;

  // Donut math
  const R = 56, C = 2 * Math.PI * R;
  let cumPct = 0;
  const arcs = totals.map(t => {
    const pct = total ? t.count / total : 0;
    const dash = pct * C;
    const gap  = C - dash;
    const offset = -cumPct * C;
    cumPct += pct;
    return { ...t, pct, dash, gap, offset };
  });

  // Per-BU bar data — stacked
  const perBU = BCM.BUSINESS_UNITS.map(bu => {
    const slice = docs.filter(d => d.bu === bu);
    return {
      bu,
      meta: BCM.BU_META[bu],
      total: slice.length,
      byKind: DOC_KINDS.reduce((acc, k) => {
        acc[k.kind] = slice.filter(d => d.kind === k.kind).length;
        return acc;
      }, {}),
    };
  });
  const maxBU = Math.max(1, ...perBU.map(b => b.total));

  return (
    <div className="panel docs-typeviz">
      <div className="panel-head">
        <h2>Documents by type</h2>
        <div className="meta">distribution across the library</div>
        <div className="right">
          {DOC_KINDS.map(k => (
            <span key={k.kind} className="chip" style={{ color: k.color, borderColor: k.color + "33", background: k.color + "12" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background: k.color, marginRight:6 }} />
              {k.kind} · {k.label}
            </span>
          ))}
        </div>
      </div>

      <div className="typeviz-body">
        {/* Donut */}
        <div className="typeviz-donut">
          <svg viewBox="-80 -80 160 160" width="180" height="180" aria-hidden="true">
            <circle r={R} fill="none" stroke="var(--bg-sunk)" strokeWidth="18" />
            {arcs.map((a, i) => (
              <circle key={a.kind}
                r={R} fill="none" stroke={a.color} strokeWidth="18"
                strokeDasharray={`${a.dash} ${a.gap}`}
                strokeDashoffset={a.offset}
                transform="rotate(-90)"
                style={{ transition: "stroke-dasharray .4s ease, stroke-dashoffset .4s ease" }}
              />
            ))}
            <text x="0" y="-2" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--ink)" fontFamily="var(--font-mono)">{total}</text>
            <text x="0" y="16" textAnchor="middle" fontSize="9" fill="var(--ink-3)" letterSpacing="1.2">DOCUMENTS</text>
          </svg>
          <div className="typeviz-donut-legend">
            {totals.map(t => (
              <div key={t.kind} className="typeviz-leg">
                <span className="sw" style={{ background: t.color }} />
                <div className="typeviz-leg-text">
                  <span className="typeviz-leg-name">{t.label}</span>
                  <span className="typeviz-leg-sub">
                    <b className="mono" style={{ color: t.color }}>{t.count}</b>
                    <span style={{ color: "var(--ink-4)" }}> · {Math.round((t.count / Math.max(1, total)) * 100)}%</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked bars per BU */}
        <div className="typeviz-bars">
          <div className="typeviz-bars-head">
            <span>By business unit</span>
            <span className="mono" style={{ color:"var(--ink-4)" }}>scale: 0–{maxBU}</span>
          </div>
          <div className="typeviz-bars-grid">
            {perBU.map(b => (
              <div key={b.bu} className="typeviz-bar-row">
                <div className="typeviz-bar-label">
                  <span style={{ width:8, height:24, borderRadius:3, background: b.meta?.color }} />
                  <div className="typeviz-bar-name">
                    <span style={{ fontWeight: 500, fontSize: 12.5 }}>{b.meta?.abbr}</span>
                    <span className="mono" style={{ color:"var(--ink-4)", fontSize: 10.5 }}>{b.meta?.name}</span>
                  </div>
                </div>
                <div className="typeviz-bar-track">
                  {DOC_KINDS.map(k => {
                    const w = (b.byKind[k.kind] / maxBU) * 100;
                    if (w === 0) return null;
                    return (
                      <div key={k.kind}
                        className="typeviz-bar-seg"
                        title={`${k.label}: ${b.byKind[k.kind]}`}
                        style={{ width: `${w}%`, background: k.color }}>
                        <span>{b.byKind[k.kind]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="typeviz-bar-total mono"><b style={{ color:"var(--ink)" }}>{b.total}</b>/3</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DocsDashboard = ({ activeBU, setActiveBU, onOpen, docs }) => {
  const totalsByKind = useMemoDL(() => DOC_KINDS.map(k => ({
    ...k, count: docs.filter(d => d.kind === k.kind).length,
  })), [docs]);

  // matrix: rows = BU, cols = kind
  const matrix = useMemoDL(() => {
    return BCM.BUSINESS_UNITS.map(bu => ({
      bu,
      cells: DOC_KINDS.map(k => docs.find(d => d.bu === bu && d.kind === k.kind))
    }));
  }, [docs]);

  return (
    <>
      {/* KPI summary */}
      <div className="kpis" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi">
          <div className="lbl">Total documents</div>
          <div className="val">{docs.length}</div>
          <div className="delta">across {BCM.BUSINESS_UNITS.length} business units</div>
        </div>
        {totalsByKind.map(t => (
          <div className="kpi" key={t.kind}>
            <div className="lbl">{t.label}</div>
            <div className="val" style={{ color: t.color }}>{t.count}</div>
            <div className="delta">type · <span className="mono">{t.kind}</span></div>
          </div>
        ))}
      </div>

      <DocsTypeViz docs={docs} />

      {/* BU cards */}
      <div className="bu-grid">
        {BCM.BUSINESS_UNITS.map(bu => (
          <BUCard
            key={bu}
            bu={bu}
            docs={docs.filter(d => d.bu === bu)}
            active={activeBU === bu}
            onClick={() => setActiveBU(activeBU === bu ? null : bu)}
          />
        ))}
      </div>

      {/* coverage matrix */}
      <div className="panel">
        <div className="panel-head">
          <h2>Coverage matrix</h2>
          <div className="meta">document types per business unit · click a cell to open</div>
          <div className="right">
            <button className="btn btn-sm"><Icon name="download" size={12} />Export</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Business unit</th>
              {DOC_KINDS.map(k => <th key={k.kind} style={{ width: 220 }}>{k.label}</th>)}
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ bu, cells }) => {
              const meta = BCM.BU_META[bu];
              const total = cells.filter(Boolean).length;
              return (
                <tr key={bu}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ width:8, height:24, borderRadius:3, background: meta.color }} />
                      <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2 }}>
                        <span className="name">{meta.name}</span>
                        <span className="mono" style={{ color:"var(--ink-4)", fontSize:10.5 }}>{meta.abbr}</span>
                      </div>
                    </div>
                  </td>
                  {cells.map((doc, i) => (
                    <td key={i}>
                      {doc ? (
                        <button className="btn btn-sm" style={{
                          width:"100%", justifyContent:"space-between",
                          background:"var(--bg-panel)", borderColor:"var(--line)"
                        }} onClick={() => onOpen(doc)}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:6, minWidth:0 }}>
                            <span className="chip chip-mono" style={{ padding:"1px 5px", fontSize:10 }}>{doc.version}</span>
                            <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--ink-2)", fontWeight:500 }}>{doc.title.replace(meta.name+" ","")}</span>
                          </span>
                          <span className="mono" style={{ color:"var(--ink-4)", fontSize:10.5 }}>{doc.updated.slice(5)}</span>
                        </button>
                      ) : (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--ink-4)", fontSize:11.5 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--line-2)" }} /> none on file
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="num"><b className="mono" style={{ color:"var(--ink)" }}>{total}</b><span style={{ color:"var(--ink-4)" }}>/3</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Library sub-view (the previous full doc list) ───────────────── */
const DocsLibrary = ({ activeBU, setActiveBU, onOpen, onRevise, onDownload, docs: docsAll }) => {
  const [kindFilter, setKindFilter] = useStateDL("ALL");
  const docs = docsAll.filter(d => {
    if (activeBU && d.bu !== activeBU) return false;
    if (kindFilter !== "ALL" && d.kind !== kindFilter) return false;
    return true;
  });
  return (
    <>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="toolbar">
          {activeBU ? (
            <>
              <span style={{ fontSize:12, color:"var(--ink-3)" }}>Filtered by</span>
              <span className="chip chip-mono" style={{ background: BCM.BU_META[activeBU].soft, color: BCM.BU_META[activeBU].color, borderColor:"transparent" }}>
                {BCM.BU_META[activeBU].abbr} — {BCM.BU_META[activeBU].name}
              </span>
              <button className="iconbtn" onClick={() => setActiveBU(null)} title="Clear"><Icon name="close" size={12} /></button>
            </>
          ) : (
            <span style={{ fontSize:12, color:"var(--ink-3)" }}>All business units</span>
          )}
          <span style={{ width: 1, height: 22, background:"var(--line)", margin: "0 6px" }} />
          <select className="select" style={{ width:170 }} value={kindFilter} onChange={e => setKindFilter(e.target.value)}>
            <option value="ALL">All types</option>
            {DOC_KINDS.map(k => <option key={k.kind} value={k.kind}>{k.label}</option>)}
          </select>
          <div style={{ marginLeft:"auto", fontSize:12, color:"var(--ink-3)" }}>
            <b style={{ color:"var(--ink)", fontFamily:"var(--font-mono)" }}>{docs.length}</b> documents
          </div>
        </div>
      </div>

      <div className="doc-grid">
        {docs.map((d, i) => <DocCard key={docKey(d)} doc={d} onOpen={onOpen} onRevise={onRevise} onDownload={onDownload} />)}
        {docs.length === 0 && (
          <div className="panel" style={{ gridColumn:"1 / -1" }}>
            <div className="empty"><b>No documents match</b>Try clearing the BU or type filter.</div>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Recent revisions table (shared) ─────────────────────────────── */
const RecentRevisions = ({ docs }) => (
  <div className="panel" style={{ marginTop: 18 }}>
    <div className="panel-head">
      <h2>Recent revisions</h2>
      <div className="meta">across all documents</div>
      <div className="right">
        <button className="btn btn-sm"><Icon name="download" size={12} />Audit log</button>
      </div>
    </div>
    <table className="tbl">
      <thead><tr><th>Document</th><th>BU</th><th>Version</th><th>Date</th><th>Note</th></tr></thead>
      <tbody>
        {docs
          .flatMap(d => d.revisions.map(r => ({ ...r, doc: d })))
          .sort((a,b) => (a.date < b.date ? 1 : -1))
          .slice(0, 8).map((r, i) => {
            const bu = BCM.BU_META[r.doc.bu];
            return (
              <tr key={i}>
                <td className="name">{r.doc.title}</td>
                <td><span className="chip chip-mono" style={{ background:bu?.soft, color:bu?.color, borderColor:"transparent" }}>{bu?.abbr}</span></td>
                <td><span className="chip chip-mono">{r.v}</span></td>
                <td className="mono" style={{ color:"var(--ink-3)" }}>{r.date}</td>
                <td>{r.note}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
);

/* ── Wrapper with sub-tabs ───────────────────────────────────────── */
const DocumentsLibrary = () => {
  const [tab, setTab] = useStateDL("dashboard"); // dashboard | library
  const [activeBU, setActiveBU] = useStateDL(null);
  const [openDoc, setOpenDoc] = useStateDL(null);
  const [docs, setDocs] = useStateDL(BCM.SEED_DOCUMENTS);
  const [uploadMode, setUploadMode] = useStateDL(null); // null | "new" | "revision"
  const [reviseDoc, setReviseDoc] = useStateDL(null);
  const [toast, setToast] = useStateDL(null);

  const goLibrary = (bu) => { setActiveBU(bu); setTab("library"); };
  const openUploadNew = () => { setReviseDoc(null); setUploadMode("new"); };
  const openRevise = (doc) => { setReviseDoc(doc); setUploadMode("revision"); setOpenDoc(null); };
  const closeUpload = () => { setUploadMode(null); setReviseDoc(null); };

  const handleDownload = (doc) => {
    if (!doc) return;
    const filename = downloadDocPDF(doc);
    setToast({ kind: "download", title: doc.title, version: doc.version, filename });
    setTimeout(() => setToast(null), 5000);
  };

  const handleUpload = (payload) => {
    if (payload.mode === "revision") {
      setDocs(prev => prev.map(d => {
        if (docKey(d) !== payload.revisionFor) return d;
        const newRev = { v: payload.version, date: todayISO(), note: payload.note };
        return {
          ...d,
          version: payload.version,
          updated: todayISO(),
          size: fmtFileSize(payload.file.size),
          revisions: [newRev, ...d.revisions],
        };
      }));
      setToast({ kind: "revision", title: payload.title, version: payload.version });
    } else {
      const newDoc = {
        id: "D-" + Date.now().toString(36).toUpperCase(),
        title: payload.title, bu: payload.bu, kind: payload.kind,
        classification: payload.classification, version: payload.version,
        owner: "You", updated: todayISO(), pages: "—",
        size: fmtFileSize(payload.file.size),
        desc: payload.desc || "Newly uploaded document.",
        revisions: [{ v: payload.version, date: todayISO(), note: "Initial upload." }],
      };
      setDocs(prev => [newDoc, ...prev]);
      setToast({ kind: "new", title: payload.title, version: payload.version });
    }
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Documents Library</h1>
          <div className="sub">Authoritative BCM documents, organized by business unit · versioned &amp; classified.</div>
        </div>
        <div className="right">
          <div className="subtabs" role="tablist" aria-label="Documents view">
            <button role="tab" aria-current={tab==="dashboard"?"page":undefined} onClick={() => setTab("dashboard")}>
              <Icon name="dashboard" size={12} />Dashboard
            </button>
            <button role="tab" aria-current={tab==="library"?"page":undefined} onClick={() => setTab("library")}>
              <Icon name="docs" size={12} />Library
            </button>
          </div>
          <button className="btn btn-primary" onClick={openUploadNew}>
            <Icon name="upload" size={13} />Upload
          </button>
        </div>
      </div>

      {tab === "dashboard"
        ? <DocsDashboard activeBU={activeBU} setActiveBU={(bu) => bu ? goLibrary(bu) : setActiveBU(null)} onOpen={setOpenDoc} docs={docs} />
        : <DocsLibrary activeBU={activeBU} setActiveBU={setActiveBU} onOpen={setOpenDoc} onRevise={openRevise} onDownload={handleDownload} docs={docs} />}

      <RecentRevisions docs={docs} />

      <DocViewer doc={openDoc} onClose={() => setOpenDoc(null)} onRevise={openRevise} onDownload={handleDownload} />

      <UploadDocModal
        open={!!uploadMode}
        mode={uploadMode || "new"}
        revisionFor={reviseDoc}
        onClose={closeUpload}
        onUpload={handleUpload}
      />

      {toast && (
        <div className="csv-toast" role="status">
          <Icon name={toast.kind === "download" ? "download" : "check"} size={14} />
          {toast.kind === "revision"
            ? <>Uploaded revision <b className="mono">{toast.version}</b> of "{toast.title}".</>
            : toast.kind === "download"
            ? <>Downloaded "{toast.title}" · <span className="mono">{toast.filename}</span></>
            : <>Uploaded "{toast.title}" <b className="mono">{toast.version}</b>.</>}
        </div>
      )}
    </div>
  );
};

window.DocumentsLibrary = DocumentsLibrary;
