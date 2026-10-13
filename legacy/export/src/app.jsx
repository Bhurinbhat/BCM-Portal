// app.jsx — shell + routing

const NAV = [
  { id:"dashboard", label:"Dashboard",                icon:"dashboard" },
  { id:"ics",       label:"Incident Command (ICS)",   icon:"shield", badge: BCM.SEED_INCIDENTS.filter(i=>i.status==="active").length, hot:true },
  { id:"users",     label:"User Management",          icon:"users", badge: BCM.SEED_USERS.length },
  { id:"docs",      label:"Documents Library",        icon:"docs",  badge: BCM.SEED_DOCUMENTS.length },
  { id:"apps",      label:"Applications & Services",  icon:"grid",  badge: BCM.SEED_APPS.length },
];

const CRUMBS = {
  dashboard:["Operations","Dashboard"],
  ics:      ["Operations","Incident Command (ICS)"],
  users:    ["Administration","User Management"],
  docs:     ["Library","Documents"],
  apps:     ["Connections","Applications & Services"],
};

const Sidebar = ({ active, onNav, session, onSignOut }) => (
  <aside className="sidebar">
    <div className="sb-brand">
      <div className="sb-mark">B</div>
      <div className="sb-wm">
        <b>BCM Portal</b>
        <small>Business Continuity</small>
      </div>
    </div>

    <div className="sb-section">Main Menu</div>
    <nav className="sb-nav">
      {NAV.map(n => (
        <button key={n.id} aria-current={active === n.id ? "page" : undefined} onClick={() => onNav(n.id)}>
          <Icon name={n.icon} size={15} />
          <span>{n.label}</span>
          {n.badge != null && <span className={`badge mono${n.hot ? " hot" : ""}`}>{n.badge}</span>}
        </button>
      ))}
    </nav>

    <div className="sb-section">Applications &amp; Services</div>
    <nav className="sb-nav">
      <button onClick={() => onNav("apps")}>
        <Icon name="map" size={15} /><span>Intelligence Map</span>
        <span className="badge mono">live</span>
      </button>
      <button onClick={() => onNav("apps")}>
        <Icon name="bell" size={15} /><span>Early Warning</span>
        <span className="badge mono">7</span>
      </button>
      <button onClick={() => onNav("apps")}>
        <Icon name="shield" size={15} /><span>Incidents</span>
        <span className="badge mono">3</span>
      </button>
      <button onClick={() => onNav("apps")}>
        <Icon name="phone" size={15} /><span>Call Tree</span>
      </button>
    </nav>

    <div className="sb-foot">
      <div className="sb-avatar">{(session?.user || "CM").slice(0, 2).toUpperCase()}</div>
      <div style={{ minWidth:0 }}>
        <div style={{ color:"#fff", lineHeight:1.1, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {session?.user || "Signed-in user"}
        </div>
        <small>{session?.role || "CMC"} · on call</small>
      </div>
      <button className="iconbtn" style={{ color:"var(--sidebar-ink-mute)", marginLeft:"auto" }} title="Sign out" onClick={onSignOut}>
        <Icon name="close" size={14} />
      </button>
    </div>
  </aside>
);

const TopBar = ({ active, onNav }) => {
  const c = CRUMBS[active] || [];
  return (
    <header className="topbar">
      <div className="crumb">
        {c[0]}<span className="crumb-sep">/</span><b>{c[1]}</b>
      </div>
      <span className="statuspill" style={{ marginLeft: 8 }}>
        <span className="dot" />Posture · READY
      </span>
      <div className="spacer" />
      <div className="searchbar">
        <Icon name="search" size={13} />
        <input placeholder="Search portal…" />
        <kbd>⌘K</kbd>
      </div>
      <button className="iconbtn" title="Notifications"><Icon name="bell" size={15} /></button>
      <button className="iconbtn" title="Settings"><Icon name="settings" size={15} /></button>
    </header>
  );
};

const App = () => {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [active, setActive] = useState("dashboard");
  const [session, setSession] = useState(() => readSession());

  // apply theme + density to :root
  useEffect(() => {
    document.documentElement.dataset.theme = t.dark ? "dark" : "light";
    document.documentElement.dataset.density = t.density;
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.dark, t.density, t.accent]);

  // Not signed in → show login screen
  if (!session) {
    return <LoginPage onSignIn={setSession} />;
  }

  const handleSignOut = () => {
    clearSession();
    setSession(null);
    setActive("dashboard");
  };

  return (
    <div className="app">
      <Sidebar active={active} onNav={setActive} session={session} onSignOut={handleSignOut} />
      <main className="main">
        <TopBar active={active} onNav={setActive} />
        <div className="content" data-screen-label={NAV.find(n => n.id === active)?.label}>
          {active === "dashboard" && <Dashboard showMap={t.showMap} onGo={setActive} />}
          {active === "ics"   && <IncidentCommand />}
          {active === "users" && <UserManagement />}
          {active === "docs"  && <DocumentsLibrary />}
          {active === "apps"  && <ApplicationsServices />}
        </div>
      </main>

      <AIAssistant />

      <TweaksPanel>        <TweakSection label="Theme" />
        <TweakToggle label="Dark mode" value={t.dark}
          onChange={(v) => setTweak("dark", v)} />
        <TweakColor label="Accent" value={t.accent}
          options={["#1d4ed8","#0d9488","#7c3aed","#a85a00","#b3261e"]}
          onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={["compact","regular","comfy"]}
          onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Show personnel map" value={t.showMap}
          onChange={(v) => setTweak("showMap", v)} />

        <TweakSection label="Session" />
        <TweakButton label="Sign out" onClick={handleSignOut} secondary />

        <TweakSection label="Navigate" />
        {NAV.map(n => (
          <TweakButton key={n.id} label={`${active === n.id ? "→ " : ""}${n.label}`}
            onClick={() => setActive(n.id)}
            secondary={active !== n.id} />
        ))}
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
