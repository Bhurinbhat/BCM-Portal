// login.jsx — gated login screen for BCM Portal
// Demo credentials: any username · password "Corp1234"

const LOGIN_PASSWORD = "Corp1234";
const SESSION_KEY = "bcm.portal.session";

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};
const writeSession = (s) => {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
};
const clearSession = () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
};

const LoginPage = ({ onSignIn }) => {
  const [user, setUser] = React.useState("");
  const [pw, setPw]     = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr]   = React.useState("");
  const [remember, setRemember] = React.useState(true);

  const submit = (e) => {
    e?.preventDefault();
    if (!user.trim()) { setErr("Enter a username."); return; }
    if (!pw)          { setErr("Enter your password."); return; }
    setBusy(true); setErr("");
    // simulate a network round-trip for realism
    setTimeout(() => {
      if (pw !== LOGIN_PASSWORD) {
        setErr("Incorrect username or password. Try again or contact the CMC office.");
        setBusy(false);
        return;
      }
      const session = {
        user: user.trim(),
        signedInAt: new Date().toISOString(),
        role: "CMC",
      };
      if (remember) writeSession(session);
      onSignIn(session);
    }, 380);
  };

  const now = new Date();
  const timeStr = now.toLocaleString("en-GB", { weekday: "short", year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });

  return (
    <div className="login-shell">
      {/* decorative left panel */}
      <aside className="login-hero" aria-hidden="true">
        <div className="login-hero-grid" />
        <div className="login-hero-glow" />
        <svg className="login-hero-art" viewBox="0 0 480 480" fill="none">
          {/* concentric rings — operational perimeter */}
          {[60, 110, 170, 230].map((r, i) => (
            <circle key={i} cx="240" cy="260" r={r}
              stroke="rgba(255,255,255,0.10)" strokeWidth="1"
              strokeDasharray={i % 2 ? "4 6" : "0"} />
          ))}
          <circle cx="240" cy="260" r="6" fill="#fff" />
          {/* spokes */}
          <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
            <line x1="240" y1="20" x2="240" y2="500" />
            <line x1="0" y1="260" x2="480" y2="260" />
            <line x1="60" y1="80" x2="420" y2="440" />
            <line x1="420" y1="80" x2="60" y2="440" />
          </g>
          {/* shield mark */}
          <g transform="translate(196 216)" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M44 4 L72 14 V44 C72 64 58 78 44 84 C30 78 16 64 16 44 V14 Z" fill="rgba(255,255,255,0.04)" />
            <path d="M30 44 L40 54 L58 32" />
          </g>
        </svg>

        <div className="login-hero-content">
          <div className="login-brand">
            <div className="login-brand-mark">B</div>
            <div>
              <div className="login-brand-name">BCM Portal</div>
              <div className="login-brand-tag">Business Continuity Management</div>
            </div>
          </div>

          <div className="login-hero-quote">
            <h1>Ready when it matters.</h1>
            <p>Unified command for operational locations, personnel, plans and live incidents — across every business unit.</p>
          </div>

          <div className="login-hero-stats">
            <div>
              <span className="num">{BCM.SEED_USERS.length}</span>
              <span className="lbl">Personnel</span>
            </div>
            <div>
              <span className="num">{BCM.SEED_SITES.length}</span>
              <span className="lbl">Sites</span>
            </div>
            <div>
              <span className="num">{BCM.BUSINESS_UNITS.length}</span>
              <span className="lbl">Business units</span>
            </div>
            <div>
              <span className="num">99.4%</span>
              <span className="lbl">Call-tree reach</span>
            </div>
          </div>

          <div className="login-hero-foot">
            <span className="login-statuspill"><span className="dot" />Posture · READY</span>
            <span className="login-hero-time">{timeStr} ICT</span>
          </div>
        </div>
      </aside>

      {/* form panel */}
      <section className="login-form-wrap">
        <form className="login-form" onSubmit={submit} noValidate>
          <div className="login-form-brand">
            <div className="login-brand-mark sm">B</div>
            <div>
              <div className="login-form-h1">BCM Portal</div>
              <div className="login-form-sub">Sign in to continue</div>
            </div>
          </div>

          <h2 className="login-h2">Welcome back</h2>
          <p className="login-help">Use your corporate credentials to access the operations portal.</p>

          <div className="login-field">
            <label htmlFor="login-user">Username</label>
            <div className="login-input">
              <Icon name="users" size={14} />
              <input
                id="login-user"
                type="text"
                autoComplete="username"
                placeholder="e.g. anchalee.s"
                value={user}
                onChange={(e) => { setUser(e.target.value); setErr(""); }}
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <div className="login-label-row">
              <label htmlFor="login-pw">Password</label>
              <a className="login-link" href="#" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
            <div className="login-input">
              <Icon name="shield" size={14} />
              <input
                id="login-pw"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr(""); }}
              />
              <button type="button" className="login-eye" aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(s => !s)}>
                <Icon name={show ? "close" : "search"} size={13} />
              </button>
            </div>
          </div>

          <label className="login-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Keep me signed in on this device</span>
          </label>

          {err && (
            <div className="login-error" role="alert">
              <Icon name="shield" size={13} />
              <span>{err}</span>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={busy}>
            {busy ? <>
              <span className="login-spinner" />Signing in…
            </> : <>
              Sign in <Icon name="external" size={13} />
            </>}
          </button>

          <div className="login-hint">
            <Icon name="bell" size={12} />
            <span>Demo credentials — any username · password <code>Corp1234</code></span>
          </div>

          <div className="login-foot">
            <span>© 2026 BCM Portal</span>
            <span className="dot-sep">·</span>
            <a className="login-link" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <span className="dot-sep">·</span>
            <a className="login-link" href="#" onClick={(e) => e.preventDefault()}>Support</a>
          </div>
        </form>
      </section>
    </div>
  );
};

Object.assign(window, { LoginPage, readSession, writeSession, clearSession });
