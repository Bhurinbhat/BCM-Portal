// assistant.jsx — BCM AI Assistant (floating chat panel)

const { useState: useStateAI, useRef: useRefAI, useEffect: useEffectAI, useMemo: useMemoAI } = React;

const SUGGESTIONS = [
  "Summarize the active incident",
  "Who is the Operations Section Chief?",
  "Which documents are due for review?",
  "What are today's advisories?",
];

const buildContext = () => {
  const inc = BCM.SEED_INCIDENTS?.find(i => i.status === "active");
  const ic   = BCM.ICS_ASSIGNMENTS?.IC?.uid;
  const ops  = BCM.ICS_ASSIGNMENTS?.OPS?.uid;
  const findU = (id) => BCM.SEED_USERS?.find(u => u.id === id);
  const icU = findU(ic), opsU = findU(ops);

  return [
    "You are the BCM Portal AI Assistant — a concise, professional helper for business-continuity operators.",
    "Tone: clear, calm, factual, like a duty officer. 1-3 short paragraphs or a tight bulleted list. Never include disclaimers about being an AI.",
    "",
    "Current portal context (use it where relevant):",
    `- Active incident: ${inc?.title_en} (${inc?.title_th}) · ${inc?.severity} · ${inc?.location_en}`,
    `- Started: ${inc?.started} · Op Period 4 (12:00 → 24:00 ICT)`,
    `- Incident Commander: ${icU?.first} ${icU?.last} (${icU?.bu})`,
    `- Operations Section Chief: ${opsU?.first} ${opsU?.last} (${opsU?.bu})`,
    `- ${BCM.SEED_INCIDENTS?.filter(i=>i.status==="active").length} active incidents tracked, ${BCM.SEED_USERS?.length} BCM contacts on file.`,
    `- Business units: ${BCM.BUSINESS_UNITS?.join(", ")}.`,
    `- Active advisories: tropical depression (Gulf of Thailand · watch), heat advisory (Bangkok), civil demonstration (Sriracha · advisory), cyber phishing surge (APAC · warning).`,
    "",
    "If the user asks for actions you cannot take (e.g. 'send the alert'), describe what they should click in the portal instead.",
  ].join("\n");
};

const AIAssistant = () => {
  const [open, setOpen]       = useStateAI(false);
  const [messages, setMsgs]   = useStateAI([
    { role: "assistant", content: "Hi! I can help with incident command, BCM documents, personnel and advisories. What do you need?" },
  ]);
  const [input, setInput]     = useStateAI("");
  const [busy, setBusy]       = useStateAI(false);
  const bodyRef = useRefAI(null);
  const taRef   = useRefAI(null);

  useEffectAI(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy, open]);

  useEffectAI(() => {
    if (open) setTimeout(() => taRef.current?.focus(), 80);
  }, [open]);

  // close on Escape
  useEffectAI(() => {
    if (!open) return;
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]);

  const send = async (forceText) => {
    const text = (forceText ?? input).trim();
    if (!text || busy) return;
    setInput("");
    const history = [...messages, { role: "user", content: text }];
    setMsgs(history);
    setBusy(true);
    try {
      // build full conversation for the model
      const convo = history.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n");
      const prompt = `${buildContext()}\n\nConversation so far:\n${convo}\n\nWrite the next Assistant reply only. Keep it short.`;
      const reply = await window.claude.complete(prompt);
      setMsgs([...history, { role: "assistant", content: reply.trim() }]);
    } catch (e) {
      setMsgs([...history, { role: "assistant", content: "Sorry — I couldn't reach the model just now. Try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMsgs([{ role: "assistant", content: "Cleared. Ask me anything about the portal." }]);
  };

  return (
    <>
      <button className="ai-fab" data-open={open} onClick={() => setOpen(o => !o)} aria-label={open ? "Close assistant" : "Open assistant"}>
        {!open && <span className="pulse" />}
        {open ? <Icon name="close" size={18} stroke={2} /> : <Icon name="sparkles" size={20} stroke={1.8} />}
      </button>

      {open && (
        <div className="ai-panel" role="dialog" aria-label="BCM AI Assistant">
          <div className="ai-hd">
            <div className="ai-avatar"><Icon name="sparkles" size={16} stroke={2} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>BCM Assistant</h3>
              <div className="sub">claude-haiku · context-aware</div>
            </div>
            <button className="iconbtn" onClick={reset} title="New chat"><Icon name="refresh" size={14} /></button>
            <button className="iconbtn" onClick={() => setOpen(false)} title="Close"><Icon name="close" size={14} /></button>
          </div>

          <div className="ai-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                <div className="bubble">{m.content}</div>
              </div>
            ))}
            {busy && <div className="ai-typing"><span /><span /><span /></div>}
          </div>

          {messages.length <= 1 && !busy && (
            <div className="ai-suggest">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="ai-input-wrap">
            <textarea
              ref={taRef}
              className="ai-input"
              placeholder="Ask about incidents, documents, personnel…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              disabled={busy}
            />
            <button className="ai-send" onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">
              <Icon name="send" size={16} stroke={2} />
            </button>
          </div>

          <div className="ai-ft">
            <Icon name="shield" size={11} />
            <span>Replies may not reflect real-time operational data. Verify before acting.</span>
          </div>
        </div>
      )}
    </>
  );
};

window.AIAssistant = AIAssistant;
