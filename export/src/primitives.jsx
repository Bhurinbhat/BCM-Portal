// primitives.jsx — shared UI atoms

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* tiny inline-SVG icons */
const Icon = ({ name, size = 14, stroke = 1.6 }) => {
  const paths = {
    dashboard:   "M3 13h7V3H3v10Zm0 8h7v-6H3v6Zm11 0h7V11h-7v10Zm0-18v6h7V3h-7Z",
    users:       "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    docs:        "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z M14 2v6h6 M9 13h6 M9 17h6",
    grid:        "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    plus:        "M12 5v14 M5 12h14",
    edit:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
    trash:       "M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6",
    download:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    upload:      "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    search:      "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35",
    settings:    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
    bell:        "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    map:         "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4Z M8 2v16 M16 6v16",
    phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z",
    shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    chevR:       "M9 18l6-6-6-6",
    chevD:       "M6 9l6 6 6-6",
    external:    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3",
    close:       "M18 6L6 18 M6 6l12 12",
    check:       "M20 6L9 17l-5-5",
    filter:      "M22 3H2l8 9.46V19l4 2v-8.54L22 3Z",
    panel:       "M3 3h18v18H3z M9 3v18",
    dot:         "M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
    sparkles:    "M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1 M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2L12 8Z",
    send:        "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7Z",
    refresh:     "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  };
  const d = paths[name] || "";
  const isFill = name === "dot";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={isFill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
};

/* ── avatar with deterministic color ─────────────────────────────────── */
const AVATAR_COLORS = ["#1d4ed8","#7c3aed","#0d9488","#a85a00","#b3261e","#0f766e","#9333ea","#1e40af","#15803d","#7c2d12"];
const hashCode = (s) => { let h=0; for (let i=0;i<s.length;i++){ h = ((h<<5)-h) + s.charCodeAt(i); h|=0; } return Math.abs(h); };
const initials = (f,l) => `${(f||"?")[0]}${(l||"")[0]||""}`.toUpperCase();
const Avatar = ({ first, last, size = 26 }) => (
  <span className="avatar" style={{ width:size, height:size, fontSize: size*0.4, background: AVATAR_COLORS[hashCode((first||"")+(last||"")) % AVATAR_COLORS.length] }}>
    {initials(first,last)}
  </span>
);

/* ── modal ──────────────────────────────────────────────────────────── */
const Modal = ({ open, onClose, title, subtitle, children, footer, width }) => {
  useEffect(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={(e) => { if (e.target.classList.contains("scrim")) onClose?.(); }}>
      <div className="modal" style={width ? { width } : undefined} role="dialog" aria-modal="true">
        <div className="modal-hd">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <div style={{ marginLeft:"auto" }}>
            <button className="iconbtn" onClick={onClose} aria-label="Close"><Icon name="close" size={14} /></button>
          </div>
        </div>
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
};

/* ── App pill ───────────────────────────────────────────────────────── */
const AppPill = ({ keyCode, on }) => {
  const map = { IM:"IM", IMAP:"IMAP", EWS:"EWS", PORTAL:"Portal" };
  return <span className="app-pill" data-on={on ? "true" : "false"} title={map[keyCode]}>{map[keyCode]}</span>;
};

Object.assign(window, { Icon, Avatar, Modal, AppPill, initials });
