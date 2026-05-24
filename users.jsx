// users.jsx — User Management screen

/* ── CSV parsing helpers ──────────────────────────────────────────── */
const parseCSV = (text) => {
  // strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i+1];
    if (inQ) {
      if (c === '"' && n === '"') { cell += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { cell += c; }
    } else {
      if (c === '"') { inQ = true; }
      else if (c === ',') { row.push(cell); cell = ""; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && n === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      }
      else { cell += c; }
    }
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => v && v.trim().length));
};

const CSV_FIELDS = [
  { key:"first",  label:"First name",   required:true,  aliases:["first name","firstname","given name","first"] },
  { key:"last",   label:"Last name",    required:true,  aliases:["last name","lastname","surname","family name","last"] },
  { key:"email",  label:"Email",        required:true,  aliases:["email","e-mail","mail"] },
  { key:"mobile", label:"Mobile",       required:false, aliases:["mobile","phone","tel","telephone","cell"] },
  { key:"bu",     label:"Business unit",required:true,  aliases:["business unit","bu","unit","department"] },
  { key:"role",   label:"Role",         required:true,  aliases:["role","bcm role","position"] },
  { key:"apps",   label:"Applications", required:false, aliases:["apps","application access","applications","access"] },
  { key:"lat",    label:"Latitude",     required:false, aliases:["lat","latitude"] },
  { key:"lng",    label:"Longitude",    required:false, aliases:["lng","lon","long","longitude"] },
];

const autoMap = (headers) => {
  const map = {};
  headers.forEach((h, i) => {
    const norm = (h || "").trim().toLowerCase();
    const f = CSV_FIELDS.find(f => f.aliases.includes(norm) || f.key === norm);
    if (f && map[f.key] === undefined) map[f.key] = i;
  });
  return map;
};

const validateRow = (r, existingEmails) => {
  const errs = [];
  if (!r.first) errs.push("missing first name");
  if (!r.last) errs.push("missing last name");
  if (!r.email) errs.push("missing email");
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) errs.push("invalid email");
  else if (existingEmails.has(r.email.toLowerCase())) errs.push("duplicate email");
  if (!r.bu) errs.push("missing BU");
  else if (!BCM.BUSINESS_UNITS.includes(r.bu)) errs.push("unknown BU");
  if (!r.role) errs.push("missing role");
  else if (!["CMC","BMT","LMT"].includes(r.role.toUpperCase())) errs.push("unknown role");
  return errs;
};

const fmtBytes = (b) => b < 1024 ? `${b} B` : b < 1024*1024 ? `${(b/1024).toFixed(1)} KB` : `${(b/1024/1024).toFixed(2)} MB`;

/* ── Import CSV modal ─────────────────────────────────────────────── */
const ImportCSVModal = ({ open, onClose, onImport, existingEmails }) => {
  const [file, setFile]     = useState(null);
  const [rows, setRows]     = useState([]);      // raw parsed rows
  const [mapping, setMapping] = useState({});    // { fieldKey: headerIndex }
  const [hasHeader, setHasHeader] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInput = React.useRef(null);

  React.useEffect(() => {
    if (!open) {
      setFile(null); setRows([]); setMapping({}); setError(""); setHasHeader(true);
    }
  }, [open]);

  const acceptFile = (f) => {
    setError("");
    if (!f) return;
    if (!/\.csv$/i.test(f.name) && f.type !== "text/csv") {
      setError("That doesn't look like a CSV file. Expected .csv"); return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File is larger than 5 MB. Split it into smaller batches."); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(String(reader.result || ""));
        if (parsed.length === 0) { setError("The file appears to be empty."); return; }
        setFile(f); setRows(parsed);
        setMapping(autoMap(parsed[0]));
      } catch (e) {
        setError("Couldn't parse this file. Check that it is valid CSV.");
      }
    };
    reader.onerror = () => setError("Couldn't read the file.");
    reader.readAsText(f);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) acceptFile(f);
  };

  const dataRows = hasHeader ? rows.slice(1) : rows;
  const headers  = hasHeader && rows[0] ? rows[0] : (rows[0] || []).map((_, i) => `Column ${i+1}`);

  const pickCol = (idx, row) => idx === undefined || idx === "" ? "" : (row[Number(idx)] || "").trim();

  const previewed = useMemo(() => dataRows.map(r => {
    const apps = pickCol(mapping.apps, r);
    return {
      first:  pickCol(mapping.first,  r),
      last:   pickCol(mapping.last,   r),
      email:  pickCol(mapping.email,  r).toLowerCase(),
      mobile: pickCol(mapping.mobile, r),
      bu:     pickCol(mapping.bu,     r),
      role:   pickCol(mapping.role,   r).toUpperCase(),
      apps:   apps ? apps.split(/[,;|]/).map(s => s.trim().toUpperCase()).filter(Boolean) : ["PORTAL"],
      lat:    pickCol(mapping.lat, r) || "13.7563",
      lng:    pickCol(mapping.lng, r) || "100.5018",
      status: "active",
    };
  }), [dataRows, mapping]);

  const seenEmail = new Set();
  const validated = previewed.map(r => {
    const errs = validateRow(r, existingEmails);
    if (seenEmail.has(r.email) && r.email) errs.push("duplicate in file");
    seenEmail.add(r.email);
    return { ...r, _errs: errs };
  });

  const okRows = validated.filter(r => r._errs.length === 0);
  const errRows = validated.length - okRows.length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import users from CSV"
      subtitle={file ? `${file.name} · ${fmtBytes(file.size)} · ${dataRows.length} rows` : "Upload a .csv file with one user per row."}
      width={780}
      footer={<>
        <button className="btn" onClick={onClose}>Cancel</button>
        <a className="btn" href={"data:text/csv;charset=utf-8," + encodeURIComponent(
          "First name,Last name,Email,Mobile,Business unit,Role,Applications,Latitude,Longitude\n" +
          "Anchalee,Suriyawong,anchalee.s@bcm.example,+66 81 234 5678,CBM,BMT,\"PORTAL,ICS,CALL\",14.5290,100.9100\n"
        )} download="bcm-users-template.csv">
          <Icon name="download" size={13} />Download template
        </a>
        <button className="btn btn-primary" disabled={okRows.length === 0} onClick={() => { onImport(okRows); onClose(); }}>
          <Icon name="check" size={13} />Import {okRows.length || ""} {okRows.length === 1 ? "user" : "users"}
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
          <div className="csv-drop-title">Drop your <b>.csv</b> file here, or <span className="lnk">browse</span></div>
          <div className="csv-drop-hint">Up to 5 MB · UTF-8 · one user per row</div>
          <input ref={fileInput} type="file" accept=".csv,text/csv" style={{ display:"none" }}
            onChange={(e) => acceptFile(e.target.files?.[0])} />
          <div className="csv-drop-cols">
            <span>Required columns:</span>
            {CSV_FIELDS.filter(f => f.required).map(f => <code key={f.key}>{f.label}</code>)}
          </div>
        </div>
      )}

      {error && <div className="csv-error"><Icon name="shield" size={13} />{error}</div>}

      {file && rows.length > 0 && (
        <>
          <div className="csv-filecard">
            <div className="csv-filecard-icon"><Icon name="docs" size={16} /></div>
            <div style={{ flex:"1 1 auto", minWidth:0 }}>
              <div className="csv-filecard-name">{file.name}</div>
              <div className="csv-filecard-meta">{fmtBytes(file.size)} · {rows.length} lines · {dataRows.length} data rows</div>
            </div>
            <label className="checkrow" style={{ padding:"4px 8px", fontSize: 12 }}>
              <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
              First row is header
            </label>
            <button className="btn btn-sm" onClick={() => { setFile(null); setRows([]); setMapping({}); }}>
              <Icon name="close" size={12} />Replace
            </button>
          </div>

          <div className="csv-section-title">Column mapping</div>
          <div className="csv-mapping">
            {CSV_FIELDS.map(f => (
              <div key={f.key} className="csv-map-row">
                <div className="csv-map-lbl">
                  {f.label}
                  {f.required && <span className="csv-req">*</span>}
                </div>
                <select
                  className="select"
                  value={mapping[f.key] ?? ""}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value === "" ? undefined : Number(e.target.value) })}
                >
                  <option value="">— not mapped —</option>
                  {headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="csv-section-title">
            Preview
            <span className="csv-summary">
              <span className="chip chip-ok chip-dot">{okRows.length} valid</span>
              {errRows > 0 && <span className="chip chip-warn chip-dot">{errRows} need attention</span>}
            </span>
          </div>
          <div className="csv-preview">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Name</th><th>Email</th><th>BU</th><th>Role</th><th>Mobile</th><th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {validated.slice(0, 10).map((r, i) => (
                  <tr key={i} className={r._errs.length ? "csv-row-err" : ""}>
                    <td>{r._errs.length ? <span className="csv-dot csv-dot-err" title="row will be skipped" /> : <span className="csv-dot csv-dot-ok" />}</td>
                    <td><span className="name">{r.first} {r.last}</span></td>
                    <td className="mono" style={{ fontSize: 11.5 }}>{r.email}</td>
                    <td>{r.bu || <span style={{ color:"var(--ink-4)" }}>—</span>}</td>
                    <td>{r.role ? <span className={`role role-${r.role}`}>{r.role}</span> : <span style={{ color:"var(--ink-4)" }}>—</span>}</td>
                    <td className="mono" style={{ fontSize: 11.5 }}>{r.mobile || <span style={{ color:"var(--ink-4)" }}>—</span>}</td>
                    <td style={{ fontSize: 11.5, color: r._errs.length ? "var(--danger)" : "var(--ink-4)" }}>
                      {r._errs.length ? r._errs.join(", ") : "ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {validated.length > 10 && (
              <div className="csv-preview-more">+ {validated.length - 10} more rows (preview shows first 10)</div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

const UserForm = ({ value, onChange }) => {
  const v = value;
  const set = (k) => (e) => onChange({ ...v, [k]: e.target?.value !== undefined ? e.target.value : e });
  const toggleApp = (key) => {
    const has = v.apps.includes(key);
    onChange({ ...v, apps: has ? v.apps.filter(x => x !== key) : [...v.apps, key] });
  };
  return (
    <>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="f-first">First name</label>
          <input id="f-first" className="input" value={v.first} onChange={set("first")} placeholder="e.g. Anchalee" />
        </div>
        <div className="field">
          <label htmlFor="f-last">Last name</label>
          <input id="f-last" className="input" value={v.last} onChange={set("last")} placeholder="e.g. Suriyawong" />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="f-bu">Business unit</label>
          <select id="f-bu" className="select" value={v.bu} onChange={set("bu")}>
            <option value="">Select…</option>
            {BCM.BUSINESS_UNITS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-role">BCM role</label>
          <select id="f-role" className="select" value={v.role} onChange={set("role")}>
            <option value="">Select…</option>
            <option value="CMC">CMC — Crisis Management Committee</option>
            <option value="BMT">BMT — Business Management Team</option>
            <option value="LMT">LMT — Local Management Team</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="f-mob">Mobile</label>
          <input id="f-mob" className="input mono" value={v.mobile} onChange={set("mobile")} placeholder="+66 81 234 5678" />
        </div>
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input id="f-email" className="input" type="email" value={v.email} onChange={set("email")} placeholder="name@bcm.example" />
        </div>
      </div>

      <div className="field">
        <label>Application access</label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {BCM.APP_KEYS.map(a => (
            <label key={a.key} className="checkrow">
              <input type="checkbox" checked={v.apps.includes(a.key)} onChange={() => toggleApp(a.key)} />
              <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--ink-3)", minWidth:46 }}>{a.key}</span>
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      </div>

    </>
  );
};

const EMPTY_USER = { id:"", first:"", last:"", bu:"", mobile:"", email:"", role:"BMT", apps:["PORTAL"], lat:"", lng:"", status:"active" };

/* ── Inline name editor ─ click to edit first/last in the table ─────── */
const InlineName = ({ user, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [first, setFirst] = useState(user.first);
  const [last, setLast]   = useState(user.last);
  const firstRef = React.useRef(null);

  React.useEffect(() => { setFirst(user.first); setLast(user.last); }, [user.first, user.last]);
  React.useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => {
        firstRef.current?.focus();
        firstRef.current?.select();
      });
    }
  }, [editing]);

  const commit = () => {
    const f = first.trim();
    const l = last.trim();
    if (!f || !l) {
      setFirst(user.first); setLast(user.last);
      setEditing(false);
      return;
    }
    if (f !== user.first || l !== user.last) onSave({ first: f, last: l });
    setEditing(false);
  };
  const cancel = () => {
    setFirst(user.first); setLast(user.last);
    setEditing(false);
  };
  const onKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "Escape") { e.preventDefault(); cancel(); }
    else if (e.key === "Tab" && e.target === firstRef.current && !e.shiftKey) {
      // allow natural tab to last input
    }
  };

  if (editing) {
    return (
      <div className="inline-name-edit" onClick={(e) => e.stopPropagation()}>
        <Avatar first={first || user.first} last={last || user.last} />
        <div className="ine-inputs">
          <input ref={firstRef}
            className="ine-input" value={first}
            placeholder="First"
            onChange={(e) => setFirst(e.target.value)}
            onKeyDown={onKey} />
          <input
            className="ine-input" value={last}
            placeholder="Last"
            onChange={(e) => setLast(e.target.value)}
            onKeyDown={onKey} />
        </div>
        <div className="ine-actions">
          <button className="iconbtn ine-save" onMouseDown={(e) => e.preventDefault()} onClick={commit} title="Save (Enter)">
            <Icon name="check" size={13} />
          </button>
          <button className="iconbtn ine-cancel" onMouseDown={(e) => e.preventDefault()} onClick={cancel} title="Cancel (Esc)">
            <Icon name="close" size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button className="inline-name" onClick={(e) => { e.stopPropagation(); setEditing(true); }} title="Click to edit name">
      <Avatar first={user.first} last={user.last} />
      <span className="inline-name-text">
        <span className="name">{user.first} {user.last}</span>
        <span className="mono inline-name-id">{user.id}</span>
      </span>
      <span className="inline-name-edit-hint"><Icon name="edit" size={11} /></span>
    </button>
  );
};

/* ── CSV export helper ────────────────────────────────── */
const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const buildUsersCSV = (rows) => {
  const headers = ["ID","First name","Last name","Email","Mobile","Business unit","Role","Applications","Latitude","Longitude","Status"];
  const lines = [headers.join(",")];
  rows.forEach(u => {
    lines.push([
      u.id, u.first, u.last, u.email, u.mobile, u.bu, u.role,
      (u.apps || []).join(";"),
      u.lat, u.lng, u.status,
    ].map(csvCell).join(","));
  });
  return "\uFEFF" + lines.join("\r\n"); // BOM for Excel
};
const downloadCSV = (text, filename) => {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
};

const UserManagement = () => {
  const [umTab, setUmTab] = useState("contacts"); // contacts | roster | swap
  const [users, setUsers] = useState(BCM.SEED_USERS);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [buFilter, setBuFilter]   = useState("ALL");
  const [sel, setSel] = useState(new Set());
  const [editing, setEditing] = useState(null); // null | "new" | user object
  const [draft, setDraft]   = useState(EMPTY_USER);
  const [confirm, setConfirm] = useState(null); // user(s) to remove
  const [importing, setImporting] = useState(false);
  const [importToast, setImportToast] = useState(null);
  const [exportToast, setExportToast] = useState(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (buFilter !== "ALL" && u.bu !== buFilter) return false;
      if (!q) return true;
      const needle = q.toLowerCase();
      return [u.first, u.last, u.email, u.mobile, u.bu, u.id].some(x => (x||"").toLowerCase().includes(needle));
    });
  }, [users, q, roleFilter, buFilter]);

  const allSelected = filtered.length > 0 && filtered.every(u => sel.has(u.id));
  const toggleAll = () => {
    const next = new Set(sel);
    if (allSelected) filtered.forEach(u => next.delete(u.id));
    else filtered.forEach(u => next.add(u.id));
    setSel(next);
  };
  const toggleOne = (id) => {
    const next = new Set(sel);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSel(next);
  };

  const openNew = () => {
    setDraft(EMPTY_USER);
    setEditing("new");
  };
  const openEdit = (u) => {
    setDraft({ ...u });
    setEditing(u);
  };
  const save = () => {
    if (editing === "new") {
      const id = "U-" + (1100 + users.length);
      setUsers(prev => [{ ...draft, id }, ...prev]);
    } else {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...draft, id: editing.id } : u));
    }
    setEditing(null);
  };
  const removeMany = (ids) => {
    setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    setSel(new Set([...sel].filter(id => !ids.includes(id))));
    setConfirm(null);
  };

  const renameUser = (id, patch) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  };

  const exportCSV = (scope = "filtered") => {
    const rows = scope === "selected" && sel.size
      ? filtered.filter(u => sel.has(u.id))
      : filtered;
    if (!rows.length) return;
    const stamp = new Date().toISOString().slice(0,10);
    const filename = `bcm-users-${stamp}-${rows.length}.csv`;
    downloadCSV(buildUsersCSV(rows), filename);
    setExportToast({ count: rows.length, filename });
    setTimeout(() => setExportToast(null), 5000);
  };

  const editingOne = editing && editing !== "new" ? editing : null;
  const draftValid = draft.first && draft.last && draft.email && draft.role && draft.bu;

  const selArr = [...sel];

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>User Management</h1>
          <div className="sub">BCM contacts, on-call rosters, and shift swaps — {users.length} contacts · {users.filter(u=>u.status!=="away").length} reachable now.</div>
        </div>
        <div className="right">
          <div className="subtabs" role="tablist" aria-label="User Management view">
            <button role="tab" aria-current={umTab==="contacts" ? "page" : undefined} onClick={() => setUmTab("contacts")}>
              <Icon name="users" size={12} />Contacts
            </button>
            <button role="tab" aria-current={umTab==="roster" ? "page" : undefined} onClick={() => setUmTab("roster")}>
              <Icon name="dashboard" size={12} />Rosters
            </button>
            <button role="tab" aria-current={umTab==="swap" ? "page" : undefined} onClick={() => setUmTab("swap")}>
              <Icon name="external" size={12} />Swap requests
            </button>
          </div>
          {umTab === "contacts" && <>
            <button className="btn" onClick={() => setImporting(true)}><Icon name="upload" size={13} />Import CSV</button>
            <button className="btn" onClick={() => exportCSV("filtered")} title={`Export ${filtered.length} ${filtered.length === 1 ? "user" : "users"} as CSV`}>
              <Icon name="download" size={13} />Export CSV
            </button>
            <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={13} />Add user</button>
          </>}
        </div>
      </div>

      {umTab === "roster" && <RosterPanel />}
      {umTab === "swap"   && <SwapPanel />}

      {umTab === "contacts" && <>
      <div className="panel">
        <div className="toolbar">
          <div className="searchbar" style={{ width: 260 }}>
            <Icon name="search" size={13} />
            <input placeholder="Search name, email, unit…" value={q} onChange={e => setQ(e.target.value)} />
            {q ? <button className="iconbtn" onClick={() => setQ("")} aria-label="Clear"><Icon name="close" size={12} /></button> : <kbd>⌘K</kbd>}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <select className="select" style={{ width:130 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="ALL">All roles</option>
              <option value="CMC">CMC</option>
              <option value="BMT">BMT</option>
              <option value="LMT">LMT</option>
            </select>
            <select className="select" style={{ width:200 }} value={buFilter} onChange={e => setBuFilter(e.target.value)}>
              <option value="ALL">All business units</option>
              {BCM.BUSINESS_UNITS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center", color:"var(--ink-3)", fontSize:12 }}>
            <span><b style={{ color:"var(--ink)", fontFamily:"var(--font-mono)" }}>{filtered.length}</b> of {users.length}</span>
          </div>
        </div>

        {sel.size > 0 && (
          <div className="selbar">
            <Icon name="check" size={13} />
            <b>{sel.size}</b> selected
            <div className="right">
              <button className="btn btn-sm" onClick={() => exportCSV("selected")}>
                <Icon name="download" size={12} />Export selected
              </button>
              <button className="btn btn-sm">Notify</button>
              <button className="btn btn-sm">Change role…</button>
              <button className="btn btn-sm btn-danger" onClick={() => setConfirm(selArr)}>Remove</button>
            </div>
          </div>
        )}

        <div style={{ overflowX:"auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width:36 }}>
                  <input type="checkbox" className="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th>Name</th>
                <th>Business Unit</th>
                <th>Role</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Access</th>
                <th>Coordinates</th>
                <th style={{ width:80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} aria-selected={sel.has(u.id)}>
                  <td><input type="checkbox" className="checkbox" checked={sel.has(u.id)} onChange={() => toggleOne(u.id)} /></td>
                  <td>
                    <InlineName user={u} onSave={(patch) => renameUser(u.id, patch)} />
                  </td>
                  <td>{u.bu}</td>
                  <td><span className={`role role-${u.role}`}>{u.role}</span></td>
                  <td className="mono">{u.mobile}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{ display:"inline-flex", gap:4, flexWrap:"wrap" }}>
                      {BCM.APP_KEYS.map(a => <AppPill key={a.key} keyCode={a.key} on={u.apps.includes(a.key)} />)}
                    </span>
                  </td>
                  <td className="mono" style={{ color:"var(--ink-3)", fontSize:11.5 }}>
                    {Number(u.lat).toFixed(4)}, {Number(u.lng).toFixed(4)}
                  </td>
                  <td>
                    <div style={{ display:"flex", gap:2, justifyContent:"flex-end" }}>
                      <button className="iconbtn" title="Edit" onClick={() => openEdit(u)}><Icon name="edit" size={13} /></button>
                      <button className="iconbtn danger" title="Remove" onClick={() => setConfirm([u.id])}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9}>
                  <div className="empty"><b>No users match</b>Try clearing filters or searching by name.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display:"flex", padding:"10px 14px", borderTop:"1px solid var(--line)", background:"var(--bg-stripe)", gap:8 }}>
          <button className="btn" onClick={openNew}><Icon name="plus" size={13} />Add</button>
          <button className="btn" disabled={sel.size !== 1} onClick={() => {
            const u = users.find(x => x.id === [...sel][0]); if (u) openEdit(u);
          }}><Icon name="edit" size={13} />Edit</button>
          <button className="btn btn-danger" disabled={sel.size === 0} onClick={() => setConfirm([...sel])}>
            <Icon name="trash" size={13} />Remove
          </button>
          <div style={{ marginLeft:"auto", fontSize:11.5, color:"var(--ink-4)", alignSelf:"center" }}>
            Last sync · <span className="mono">today 09:42</span>
          </div>
        </div>
      </div>
      </>}

      {/* Import CSV modal */}
      <ImportCSVModal
        open={importing}
        onClose={() => setImporting(false)}
        existingEmails={new Set(users.map(u => (u.email || "").toLowerCase()))}
        onImport={(newRows) => {
          const base = users.length + 1100;
          const added = newRows.map((r, i) => ({
            ...r,
            id: "U-" + (base + i),
            lat: Number(r.lat),
            lng: Number(r.lng),
          }));
          setUsers(prev => [...added, ...prev]);
          setImportToast({ count: added.length, at: Date.now() });
          setTimeout(() => setImportToast(null), 5000);
        }}
      />

      {importToast && (
        <div className="csv-toast" role="status">
          <Icon name="check" size={14} />
          Imported <b>{importToast.count}</b> {importToast.count === 1 ? "user" : "users"} from CSV.
        </div>
      )}

      {exportToast && (
        <div className="csv-toast" role="status">
          <Icon name="download" size={14} />
          Exported <b>{exportToast.count}</b> {exportToast.count === 1 ? "user" : "users"} · <span className="mono">{exportToast.filename}</span>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add user" : `Edit · ${editingOne?.first} ${editingOne?.last}`}
        subtitle={editing === "new" ? "Create a new BCM contact." : `User ID ${editingOne?.id}`}
        footer={<>
          <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
          <button className="btn btn-primary" disabled={!draftValid} onClick={save}>
            <Icon name="check" size={13} />
            {editing === "new" ? "Create user" : "Save changes"}
          </button>
        </>}
      >
        <UserForm value={draft} onChange={setDraft} />
      </Modal>

      {/* Confirm remove */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={`Remove ${confirm?.length === 1 ? "user" : `${confirm?.length} users`}?`}
        subtitle="This will revoke application access and remove them from call-tree templates."
        width={460}
        footer={<>
          <button className="btn" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => removeMany(confirm)}><Icon name="trash" size={13} />Remove</button>
        </>}
      >
        <div style={{ fontSize:13, color:"var(--ink-2)" }}>
          {confirm?.map(id => {
            const u = users.find(x => x.id === id);
            if (!u) return null;
            return (
              <div key={id} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid var(--line)" }}>
                <Avatar first={u.first} last={u.last} />
                <div style={{ display:"flex", flexDirection:"column", lineHeight:1.2 }}>
                  <span className="name">{u.first} {u.last}</span>
                  <span style={{ color:"var(--ink-4)", fontSize:11 }}>{u.bu} · <span className={`role role-${u.role}`}>{u.role}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

window.UserManagement = UserManagement;
