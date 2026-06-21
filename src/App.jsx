import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "growthdesk_v1";
const GIST_ID = "";
const GIST_TOKEN = "";
const EDIT_SECRET = "GROWTHDESK_EDIT";
const GIST_FILENAME = "growthdesk-data.json";

const isEditMode = () => {
  try {
    if (!EDIT_SECRET || EDIT_SECRET === "") return false;
    const val = new URLSearchParams(window.location.search).get("edit");
    if (!val || val === "") return false;
    return val === EDIT_SECRET;
  } catch { return false; }
};

const fetchFromGist = async () => {
  if (!GIST_ID || !GIST_TOKEN) return null;
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `token ${GIST_TOKEN}` }
    });
    const json = await res.json();
    const content = json.files?.[GIST_FILENAME]?.content;
    return content ? JSON.parse(content) : null;
  } catch { return null; }
};

const saveToGist = async (data) => {
  if (!GIST_ID || !GIST_TOKEN) return;
  try {
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: { Authorization: `token ${GIST_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } } })
    });
  } catch (e) { console.error("Gist save failed", e); }
};

const uid = () => Math.random().toString(36).slice(2, 9);

const COLORS = [
  { color: "#FF9900", lightColor: "#FFF3E0" },
  { color: "#7B2D8B", lightColor: "#F3E5F5" },
  { color: "#1A73E8", lightColor: "#E8F0FE" },
  { color: "#0F6E56", lightColor: "#E1F5EE" },
  { color: "#D85A30", lightColor: "#FAECE7" },
  { color: "#639922", lightColor: "#EAF3DE" },
];
const ICONS = ["☁️","🤖","🏗️","🔐","📊","🌐","🗄️","⚡","🔧","📱","🏆","📚"];

const defaultData = {
  certs: [
    {
      id: "clf-c02", title: "AWS Cloud Practitioner", code: "CLF-C02",
      color: "#FF9900", lightColor: "#FFF3E0", icon: "☁️",
      description: "Foundational understanding of AWS Cloud concepts, services, and terminology.",
      domains: [
        {
          id: "d1", name: "Cloud Concepts", weight: "24%",
          topics: [
            {
              id: "t1", name: "What is Cloud Computing?",
              notes: ["<p>Cloud computing is <strong>on-demand delivery</strong> of IT resources over the internet with <strong>pay-as-you-go pricing</strong>.</p>"],
              mentalModels: ["🧠 Think of IaaS as renting a car (you drive), PaaS as a taxi (driver provided), SaaS as a bus (fixed route)."],
              refs: [{ label: "AWS Cloud Computing Overview", url: "https://aws.amazon.com/what-is-cloud-computing/" }],
              quiz: [{ type: "single", q: "What does pay-as-you-go mean?", options: ["Pay once", "Pay only for what you use", "Monthly flat fee", "Pay per user"], answer: 1, explanation: "You only pay for what you consume." }]
            }
          ]
        }
      ]
    },
    {
      id: "aif-c01", title: "AWS AI Practitioner", code: "AIF-C01",
      color: "#7B2D8B", lightColor: "#F3E5F5", icon: "🤖",
      description: "Foundational knowledge of AI/ML concepts and AWS AI/ML services.",
      domains: [
        {
          id: "a1", name: "Fundamentals of AI & ML", weight: "20%",
          topics: [
            {
              id: "a1t1", name: "AI, ML & Deep Learning Concepts",
              notes: ["<p><strong>AI</strong>: Machines simulating human intelligence. <strong>ML</strong>: Systems that learn from data.</p>"],
              mentalModels: ["🧠 AI ⊃ ML ⊃ Deep Learning — each is a subset of the previous."],
              refs: [{ label: "AWS ML Concepts", url: "https://aws.amazon.com/what-is/machine-learning/" }],
              quiz: [{ type: "single", q: "Which type of ML uses labeled training data?", options: ["Unsupervised", "Reinforcement", "Supervised", "Generative"], answer: 2, explanation: "Supervised learning uses labeled examples to train models." }]
            }
          ]
        }
      ]
    }
  ]
};

// ── Data hook ──────────────────────────────────────────────────
function useData() {
  const [data, setData] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  useEffect(() => {
    (async () => {
      setSyncing(true);
      const gistData = await fetchFromGist();
      if (gistData) {
        setData(gistData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gistData));
      } else {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          setData(saved ? JSON.parse(saved) : defaultData);
        } catch { setData(defaultData); }
      }
      setSyncing(false);
      setLastSynced(new Date());
    })();
  }, []);

  const save = async (newData) => {
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    if (isEditMode()) {
      setSyncing(true);
      await saveToGist(newData);
      setSyncing(false);
      setLastSynced(new Date());
    }
  };

  return [data, save, syncing, lastSynced];
}

// ── Rich Text CSS ──────────────────────────────────────────────
const richCSS = `
  .rich-view, .rich-edit {
    font-size: 14px; line-height: 1.8; color: var(--color-text-primary);
    text-align: left; font-family: inherit; word-break: break-word;
  }
  .rich-edit:empty:before { content: attr(data-placeholder); color: #888; pointer-events: none; }
  .rich-edit { min-height: 120px; padding: 12px 14px; outline: none; background: var(--color-background-primary); }
  .rich-view h3, .rich-edit h3 { font-size: 17px; font-weight: 700; margin: 14px 0 6px; }
  .rich-view h4, .rich-edit h4 { font-size: 15px; font-weight: 600; margin: 10px 0 4px; }
  .rich-view p, .rich-edit p { margin: 6px 0; }
  .rich-view ul, .rich-edit ul { list-style: disc; padding-left: 22px; margin: 6px 0; }
  .rich-view ol, .rich-edit ol { list-style: decimal; padding-left: 22px; margin: 6px 0; }
  .rich-view li, .rich-edit li { margin: 4px 0; padding-left: 4px; }
  .rich-view ul ul, .rich-edit ul ul { list-style: circle; padding-left: 20px; }
  .rich-view blockquote, .rich-edit blockquote { border-left: 3px solid #FF9900; padding: 6px 12px; margin: 8px 0; background: var(--color-background-secondary); border-radius: 0 6px 6px 0; font-style: italic; }
  .rich-view code, .rich-edit code { background: var(--color-background-secondary); padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
  .rich-view hr, .rich-edit hr { border: none; border-top: 1px solid var(--color-border-tertiary); margin: 12px 0; }
`;

// ── Rich Editor ────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }) {
  const ref = useRef(null);
  const init = useRef(false);
  useEffect(() => {
    if (ref.current && !init.current) { ref.current.innerHTML = value || ""; init.current = true; }
  }, []);
  const exec = (cmd, val = null) => { ref.current?.focus(); document.execCommand(cmd, false, val); };
  const tools = [
    { label: "B", cmd: "bold", style: { fontWeight: "bold" } },
    { label: "I", cmd: "italic", style: { fontStyle: "italic" } },
    { label: "U", cmd: "underline", style: { textDecoration: "underline" } },
    { label: "H1", cmd: "formatBlock", val: "h3" },
    { label: "H2", cmd: "formatBlock", val: "h4" },
    { label: "¶", cmd: "formatBlock", val: "p" },
    { label: "❝", cmd: "formatBlock", val: "blockquote" },
    { label: "• List", cmd: "insertUnorderedList" },
    { label: "1. List", cmd: "insertOrderedList" },
    { label: "⇥ Indent", cmd: "indent" },
    { label: "⇤ Outdent", cmd: "outdent" },
    { label: "—", cmd: "insertHorizontalRule" },
  ];
  return (
    <div style={{ border: "1px solid var(--color-border-secondary)", borderRadius: 10, overflow: "hidden" }}>
      <style>{richCSS}</style>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "8px 10px", background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)" }}>
        {tools.map((t, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); exec(t.cmd, t.val || null); }}
            style={{ ...t.style, padding: "4px 9px", borderRadius: 5, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        data-placeholder={placeholder} className="rich-edit" />
    </div>
  );
}

function NoteContent({ html }) {
  return <><style>{richCSS}</style><div className="rich-view" dangerouslySetInnerHTML={{ __html: html }} /></>;
}

// ── Shared UI ──────────────────────────────────────────────────
const Btn = ({ onClick, children, variant = "ghost", color, style = {} }) => {
  const base = { cursor: "pointer", borderRadius: 8, fontSize: 13, padding: "6px 12px", fontFamily: "inherit" };
  const v = {
    ghost: { background: "transparent", border: "1px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" },
    primary: { background: color || "#FF9900", border: "none", color: "#fff" },
  };
  return <button onClick={onClick} style={{ ...base, ...v[variant], ...style }}>{children}</button>;
};

const Input = ({ value, onChange, placeholder, multiline, rows = 3, style = {} }) => {
  const base = { width: "100%", fontSize: 14, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "inherit", boxSizing: "border-box", resize: multiline ? "vertical" : "none", outline: "none" };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, ...style }} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, ...style }} />;
};

const Tag = ({ children, color }) => (
  <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, background: color + "22", color, fontWeight: 500 }}>{children}</span>
);

// ── Export/Import ──────────────────────────────────────────────
function ExportImport({ data, onImport }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `growthdesk-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "✅ Backup downloaded!" });
    setTimeout(() => setMsg(null), 3000);
  };
  const importData = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.certs) throw new Error("Invalid");
        onImport(parsed);
        setMsg({ ok: true, text: "✅ Restored!" });
      } catch { setMsg({ ok: false, text: "❌ Invalid file." }); }
      setTimeout(() => setMsg(null), 3000);
    };
    reader.readAsText(file); e.target.value = "";
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={exportData} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>⬇️ Export</button>
      <button onClick={() => fileRef.current?.click()} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>⬆️ Import</button>
      <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
      {msg && <span style={{ fontSize: 12, color: msg.ok ? "#4CAF50" : "#E53935" }}>{msg.text}</span>}
    </div>
  );
}

// ── Quiz ───────────────────────────────────────────────────────
function QuizMode({ questions }) {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions.length) return <div style={{ padding: "1rem", color: "var(--color-text-secondary)", fontSize: 14 }}>No quiz questions yet.</div>;

  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: 48 }}>{score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "📚"}</div>
      <h3 style={{ color: "var(--color-text-primary)" }}>Score: {score} / {questions.length}</h3>
      <Btn onClick={() => { setCur(0); setSel([]); setSubmitted(false); setScore(0); setDone(false); }}>Retry</Btn>
    </div>
  );

  const q = questions[cur];
  const isMulti = q.type === "multi";
  const isExplain = q.type === "explain";
  const correctAnswers = Array.isArray(q.answer) ? q.answer.map(Number) : q.answer !== null && q.answer !== undefined ? [Number(q.answer)] : [];

  const toggle = (i) => {
    if (submitted) return;
    setSel(isMulti ? (sel.includes(i) ? sel.filter(x => x !== i) : [...sel, i]) : [i]);
  };

  const submit = () => {
    if (sel.length === 0) return;
    setSubmitted(true);
    const correct = isMulti
      ? [...correctAnswers].sort().join(",") === [...sel].sort().join(",")
      : sel[0] === correctAnswers[0];
    if (correct) setScore(s => s + 1);
  };

  const next = () => {
    if (cur + 1 >= questions.length) setDone(true);
    else { setCur(c => c + 1); setSel([]); setSubmitted(false); }
  };

  const optStyle = (i) => {
    const base = { textAlign: "left", padding: "10px 14px", borderRadius: 8, cursor: submitted ? "default" : "pointer", fontSize: 14, fontFamily: "inherit", width: "100%", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 };
    if (!submitted) return { ...base, background: sel.includes(i) ? "rgba(255,153,0,0.1)" : "var(--color-background-primary)", border: `1px solid ${sel.includes(i) ? "#FF9900" : "var(--color-border-tertiary)"}`, color: "var(--color-text-primary)" };
    if (correctAnswers.includes(i)) return { ...base, background: "#E8F5E9", border: "1px solid #4CAF50", color: "#2E7D32" };
    if (sel.includes(i)) return { ...base, background: "#FFEBEE", border: "1px solid #E53935", color: "#C62828" };
    return { ...base, background: "var(--color-background-primary)", border: "1px solid var(--color-border-tertiary)", color: "var(--color-text-primary)", opacity: 0.5 };
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Q {cur + 1} / {questions.length}</span>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Score: {score}</span>
      </div>
      <div style={{ height: 3, background: "var(--color-background-secondary)", borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: 3, background: "#FF9900", borderRadius: 2, width: `${(cur / questions.length) * 100}%` }} />
      </div>
      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isExplain ? "#E8F0FE" : isMulti ? "#F3E5F5" : "#FFF3E0", color: isExplain ? "#1A73E8" : isMulti ? "#7B2D8B" : "#FF9900", fontWeight: 500 }}>
        {isExplain ? "📖 Explanation" : isMulti ? "☑️ Multiple Select" : "🔘 Single Choice"}
      </span>
      <div style={{ marginTop: 12, marginBottom: 14 }}><NoteContent html={q.q} /></div>
      {!isExplain && (
        <div style={{ marginBottom: 12 }}>
          {isMulti && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>Select all that apply</p>}
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => toggle(i)} style={optStyle(i)}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{isMulti ? (sel.includes(i) ? "☑" : "☐") : `${String.fromCharCode(65 + i)}.`}</span>
              <span>{opt}</span>
              {submitted && correctAnswers.includes(i) && <span style={{ marginLeft: "auto", color: "#4CAF50" }}>✓</span>}
            </button>
          ))}
        </div>
      )}
      {!submitted && !isExplain && (
        <button onClick={submit} disabled={sel.length === 0} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: sel.length > 0 ? "#FF9900" : "var(--color-background-secondary)", color: sel.length > 0 ? "#fff" : "var(--color-text-secondary)", fontSize: 14, cursor: sel.length > 0 ? "pointer" : "default", fontFamily: "inherit", fontWeight: 500, marginBottom: 10 }}>
          Submit Answer
        </button>
      )}
      {(submitted || isExplain) && q.explanation && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px", marginBottom: 12, borderLeft: "3px solid #FF9900" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#FF9900" }}>💡 EXPLANATION</p>
          <NoteContent html={q.explanation} />
        </div>
      )}
      {(submitted || isExplain) && (
        <button onClick={next} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#FF9900", color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
          {cur + 1 >= questions.length ? "See results →" : "Next →"}
        </button>
      )}
    </div>
  );
}

function QuizEditor({ initial, onSave, onCancel }) {
  const blank = { type: "single", q: "", options: ["", "", "", ""], answer: 0, explanation: "" };
  const [form, setForm] = useState(initial || blank);
  const [qHtml, setQHtml] = useState(initial?.q || "");
  const [expHtml, setExpHtml] = useState(initial?.explanation || "");
  const [multiAns, setMultiAns] = useState(initial?.type === "multi" && Array.isArray(initial?.answer) ? initial.answer : []);
  const isExplain = form.type === "explain";
  const isMulti = form.type === "multi";
  const valid = qHtml.replace(/<[^>]*>/g, "").trim().length > 0;

  const save = () => {
    if (!valid) return;
    const answer = isMulti ? multiAns.map(Number).sort() : isExplain ? null : Number(form.answer);
    onSave({ ...form, q: qHtml, explanation: expHtml, answer, type: form.type });
  };

  return (
    <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>QUESTION TYPE</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[{ id: "single", label: "🔘 Single" }, { id: "multi", label: "☑️ Multiple" }, { id: "explain", label: "📖 Explanation" }].map(t => (
          <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${form.type === t.id ? "#FF9900" : "var(--color-border-tertiary)"}`, background: form.type === t.id ? "#FFF3E0" : "transparent", color: form.type === t.id ? "#FF9900" : "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: form.type === t.id ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>QUESTION</p>
      <RichEditor value={qHtml} onChange={setQHtml} placeholder={isExplain ? "Write your explanation or concept..." : "Enter your question..."} />
      {!isExplain && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>OPTIONS — {isMulti ? "check all correct" : "select one correct"}</p>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              {isMulti
                ? <input type="checkbox" checked={multiAns.includes(i)} onChange={() => setMultiAns(a => a.includes(i) ? a.filter(x => x !== i) : [...a, i])} style={{ accentColor: "#FF9900", width: 16, height: 16 }} />
                : <input type="radio" checked={form.answer === i} onChange={() => setForm(f => ({ ...f, answer: i }))} style={{ accentColor: "#FF9900" }} />
              }
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 20 }}>{String.fromCharCode(65 + i)}.</span>
              <Input value={opt} onChange={v => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; })} placeholder={`Option ${String.fromCharCode(65 + i)}`} style={{ marginBottom: 0 }} />
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>EXPLANATION <span style={{ opacity: 0.6 }}>(optional)</span></p>
        <RichEditor value={expHtml} onChange={setExpHtml} placeholder="Explain the answer..." />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn onClick={save} variant="primary" color="#FF9900" style={{ opacity: valid ? 1 : 0.5 }}>Save question</Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Topic View ─────────────────────────────────────────────────
function TopicView({ topic, certColor, onBack, onUpdate, editMode }) {
  const [tab, setTab] = useState("notes");
  const [addingNote, setAddingNote] = useState(false);
  const [addingMM, setAddingMM] = useState(false);
  const [addingRef, setAddingRef] = useState(false);
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [editNoteIdx, setEditNoteIdx] = useState(null);
  const [editMMIdx, setEditMMIdx] = useState(null);
  const [editQuizIdx, setEditQuizIdx] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newMM, setNewMM] = useState("");
  const [newRef, setNewRef] = useState({ label: "", url: "" });
  const [editNoteVal, setEditNoteVal] = useState("");
  const [editMMVal, setEditMMVal] = useState("");

  const update = patch => onUpdate({ ...topic, ...patch });
  const tabs = [
    { id: "notes", label: "📖 Notes", count: topic.notes.length },
    { id: "mental", label: "🧠 Mental Models", count: topic.mentalModels.length },
    { id: "quiz", label: "📝 Quiz", count: topic.quiz.length },
    { id: "refs", label: "🔗 References", count: topic.refs.length },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: certColor, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
        <h2 style={{ color: "var(--color-text-primary)", fontSize: 16, margin: 0 }}>{topic.name}</h2>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${tab === t.id ? certColor : "var(--color-border-tertiary)"}`, background: tab === t.id ? certColor : "transparent", color: tab === t.id ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* NOTES */}
      {tab === "notes" && (
        <div>
          {topic.notes.map((n, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {editMode && editNoteIdx === i ? (
                <div>
                  <RichEditor value={editNoteVal} onChange={setEditNoteVal} placeholder="Edit note..." />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <Btn variant="primary" color={certColor} onClick={() => { const notes = [...topic.notes]; notes[i] = editNoteVal; update({ notes }); setEditNoteIdx(null); }}>Save</Btn>
                    <Btn onClick={() => setEditNoteIdx(null)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ borderLeft: `3px solid ${certColor}`, background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <NoteContent html={n} />
                    {editMode && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { setEditNoteIdx(i); setEditNoteVal(n); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                        <button onClick={() => update({ notes: topic.notes.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {editMode && (addingNote ? (
            <div style={{ marginTop: 10 }}>
              <RichEditor value={newNote} onChange={setNewNote} placeholder="Write your note..." />
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Btn variant="primary" color={certColor} onClick={() => { if (newNote.trim()) { update({ notes: [...topic.notes, newNote] }); setNewNote(""); setAddingNote(false); } }}>Add note</Btn>
                <Btn onClick={() => { setAddingNote(false); setNewNote(""); }}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingNote(true)} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add note</button>
          ))}
        </div>
      )}

      {/* MENTAL MODELS */}
      {tab === "mental" && (
        <div>
          {topic.mentalModels.map((m, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              {editMode && editMMIdx === i ? (
                <div>
                  <RichEditor value={editMMVal} onChange={setEditMMVal} placeholder="Edit mental model..." />
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <Btn variant="primary" color={certColor} onClick={() => { const mm = [...topic.mentalModels]; mm[i] = editMMVal; update({ mentalModels: mm }); setEditMMIdx(null); }}>Save</Btn>
                    <Btn onClick={() => setEditMMIdx(null)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, padding: "12px 14px", border: `1px solid var(--color-border-tertiary)`, borderLeft: `3px solid ${certColor}`, borderRadius: 10, background: "var(--color-background-secondary)" }}>
                  <div style={{ flex: 1 }}><NoteContent html={m} /></div>
                  {editMode && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditMMIdx(i); setEditMMVal(m); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                      <button onClick={() => update({ mentalModels: topic.mentalModels.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {editMode && (addingMM ? (
            <div style={{ marginTop: 10 }}>
              <RichEditor value={newMM} onChange={setNewMM} placeholder="🧠 Think of X as Y..." />
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <Btn variant="primary" color={certColor} onClick={() => { if (newMM.trim()) { update({ mentalModels: [...topic.mentalModels, newMM] }); setNewMM(""); setAddingMM(false); } }}>Add</Btn>
                <Btn onClick={() => { setAddingMM(false); setNewMM(""); }}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingMM(true)} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add mental model</button>
          ))}
        </div>
      )}

      {/* QUIZ */}
      {tab === "quiz" && (
        <div>
          {editMode && (addingQuiz || editQuizIdx !== null) ? (
            <QuizEditor
              initial={editQuizIdx !== null ? topic.quiz[editQuizIdx] : null}
              onSave={q => {
                if (editQuizIdx !== null) { const quiz = [...topic.quiz]; quiz[editQuizIdx] = q; update({ quiz }); setEditQuizIdx(null); }
                else { update({ quiz: [...topic.quiz, q] }); setAddingQuiz(false); }
              }}
              onCancel={() => { setAddingQuiz(false); setEditQuizIdx(null); }}
            />
          ) : (
            <>
              {topic.quiz.length > 0 && <div style={{ marginBottom: 16 }}><QuizMode questions={topic.quiz} /></div>}
              {editMode && (
                <div style={{ borderTop: topic.quiz.length > 0 ? "1px solid var(--color-border-tertiary)" : "none", paddingTop: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>MANAGE QUESTIONS</p>
                  {topic.quiz.map((q, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 10, background: q.type === "explain" ? "#E8F0FE" : q.type === "multi" ? "#F3E5F5" : "#FFF3E0", color: q.type === "explain" ? "#1A73E8" : q.type === "multi" ? "#7B2D8B" : "#FF9900", fontWeight: 500, marginRight: 6 }}>
                          {q.type === "explain" ? "📖" : q.type === "multi" ? "☑️" : "🔘"}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{q.q.replace(/<[^>]*>/g, "").slice(0, 80)}{q.q.replace(/<[^>]*>/g, "").length > 80 ? "..." : ""}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setEditQuizIdx(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                        <button onClick={() => update({ quiz: topic.quiz.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setAddingQuiz(true)} style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add quiz question</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* REFS */}
      {tab === "refs" && (
        <div>
          {topic.refs.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 8 }}>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ color: certColor, fontSize: 14, flex: 1, textDecoration: "none" }}>🔗 {r.label}</a>
              {editMode && <button onClick={() => update({ refs: topic.refs.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>}
            </div>
          ))}
          {editMode && (addingRef ? (
            <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 10, padding: 12, marginTop: 8 }}>
              <Input value={newRef.label} onChange={v => setNewRef(r => ({ ...r, label: v }))} placeholder="Label" style={{ marginBottom: 8 }} />
              <Input value={newRef.url} onChange={v => setNewRef(r => ({ ...r, url: v }))} placeholder="URL (https://...)" style={{ marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="primary" color={certColor} onClick={() => { if (newRef.label.trim() && newRef.url.trim()) { update({ refs: [...topic.refs, { ...newRef }] }); setNewRef({ label: "", url: "" }); setAddingRef(false); } }}>Add</Btn>
                <Btn onClick={() => { setAddingRef(false); setNewRef({ label: "", url: "" }); }}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingRef(true)} style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add reference</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Cert View ──────────────────────────────────────────────────
function CertView({ cert, onUpdate, editMode }) {
  const [selTopic, setSelTopic] = useState(null);
  const [selDomainId, setSelDomainId] = useState(null);
  const [addingDomain, setAddingDomain] = useState(false);
  const [addingTopicFor, setAddingTopicFor] = useState(null);
  const [newDomain, setNewDomain] = useState({ name: "", weight: "" });
  const [newTopic, setNewTopic] = useState("");

  const updateTopic = (domainId, updated) => {
    onUpdate({ ...cert, domains: cert.domains.map(d => d.id !== domainId ? d : { ...d, topics: d.topics.map(t => t.id !== updated.id ? t : updated) }) });
  };

  if (selTopic) return (
    <TopicView
      topic={selTopic} certColor={cert.color} editMode={editMode}
      onBack={() => setSelTopic(null)}
      onUpdate={updated => { updateTopic(selDomainId, updated); setSelTopic(updated); }}
    />
  );

  return (
    <div>
      <div style={{ background: cert.lightColor, borderRadius: 12, padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 32 }}>{cert.icon}</span>
        <div>
          <p style={{ fontSize: 11, color: cert.color, fontWeight: 500, margin: 0 }}>{cert.code}</p>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: 17, margin: "2px 0" }}>{cert.title}</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>{cert.description}</p>
        </div>
      </div>

      {cert.domains.map(domain => (
        <div key={domain.id} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ color: "var(--color-text-primary)", fontSize: 14, margin: 0 }}>{domain.name}</h3>
              {domain.weight && <Tag color={cert.color}>{domain.weight}</Tag>}
            </div>
            {editMode && (
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setAddingTopicFor(domain.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: cert.color, fontFamily: "inherit" }}>+ Topic</button>
                <button onClick={() => onUpdate({ ...cert, domains: cert.domains.filter(d => d.id !== domain.id) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>🗑️</button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {domain.topics.map(topic => (
              <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => { setSelTopic(topic); setSelDomainId(domain.id); }} style={{ textAlign: "left", flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}>{topic.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{topic.notes.length} notes · {topic.mentalModels.length} models · {topic.quiz.length} quiz</p>
                  </div>
                  <span style={{ color: cert.color, fontSize: 18 }}>›</span>
                </button>
                {editMode && <button onClick={() => onUpdate({ ...cert, domains: cert.domains.map(d => d.id !== domain.id ? d : { ...d, topics: d.topics.filter(t => t.id !== topic.id) }) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>🗑️</button>}
              </div>
            ))}
            {editMode && addingTopicFor === domain.id && (
              <div style={{ padding: "10px 12px", border: "1px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-secondary)" }}>
                <Input value={newTopic} onChange={setNewTopic} placeholder="Topic name..." style={{ marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="primary" color={cert.color} onClick={() => { if (!newTopic.trim()) return; const t = { id: uid(), name: newTopic.trim(), notes: [], mentalModels: [], refs: [], quiz: [] }; onUpdate({ ...cert, domains: cert.domains.map(d => d.id !== domain.id ? d : { ...d, topics: [...d.topics, t] }) }); setNewTopic(""); setAddingTopicFor(null); }}>Add</Btn>
                  <Btn onClick={() => { setAddingTopicFor(null); setNewTopic(""); }}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {editMode && (addingDomain ? (
        <div style={{ padding: "12px 14px", border: `1px dashed ${cert.color}`, borderRadius: 10, marginTop: 16 }}>
          <Input value={newDomain.name} onChange={v => setNewDomain(d => ({ ...d, name: v }))} placeholder="Domain name..." style={{ marginBottom: 8 }} />
          <Input value={newDomain.weight} onChange={v => setNewDomain(d => ({ ...d, weight: v }))} placeholder="Exam weight e.g. 20% (optional)" style={{ marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="primary" color={cert.color} onClick={() => { if (!newDomain.name.trim()) return; const d = { id: uid(), name: newDomain.name.trim(), weight: newDomain.weight.trim(), topics: [] }; onUpdate({ ...cert, domains: [...cert.domains, d] }); setNewDomain({ name: "", weight: "" }); setAddingDomain(false); }}>Add domain</Btn>
            <Btn onClick={() => { setAddingDomain(false); setNewDomain({ name: "", weight: "" }); }}>Cancel</Btn>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingDomain(true)} style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${cert.color}`, background: "transparent", color: cert.color, cursor: "pointer", fontSize: 13, marginTop: 8, fontFamily: "inherit" }}>+ Add domain</button>
      ))}
    </div>
  );
}

// ── New Cert Form ──────────────────────────────────────────────
function NewCertForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: "", code: "", description: "", icon: "☁️", color: COLORS[0].color, lightColor: COLORS[0].lightColor });
  const valid = form.title.trim() && form.code.trim();
  return (
    <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px", marginTop: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 14 }}>New Subject</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <Input value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Title" />
        <Input value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="Code (e.g. SAA-C03)" />
      </div>
      <Input value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Short description..." style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>ICON</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {ICONS.map(ic => <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ fontSize: 20, padding: "4px 8px", borderRadius: 6, border: `1px solid ${form.icon === ic ? "#FF9900" : "var(--color-border-tertiary)"}`, background: form.icon === ic ? "#FFF3E0" : "transparent", cursor: "pointer" }}>{ic}</button>)}
      </div>
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 6 }}>COLOR</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {COLORS.map(c => <button key={c.color} onClick={() => setForm(f => ({ ...f, color: c.color, lightColor: c.lightColor }))} style={{ width: 28, height: 28, borderRadius: "50%", background: c.color, border: form.color === c.color ? "3px solid var(--color-text-primary)" : "2px solid transparent", cursor: "pointer" }} />)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="primary" color={form.color} onClick={() => valid && onSave({ ...form, id: uid(), domains: [] })} style={{ opacity: valid ? 1 : 0.5 }}>Create</Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  const [data, saveData, syncing, lastSynced] = useData();
  const [selCert, setSelCert] = useState(null);
  const [addingCert, setAddingCert] = useState(false);
  const editMode = isEditMode();

  if (!data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--color-text-secondary)" }}>Loading GrowthDesk...</div>;

  const updateCert = updated => {
    const certs = data.certs.map(c => c.id !== updated.id ? c : updated);
    saveData({ ...data, certs });
    if (selCert?.id === updated.id) setSelCert(updated);
  };

  const totalTopics = data.certs.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.topics.length, 0), 0);
  const totalDomains = data.certs.reduce((a, c) => a + c.domains.length, 0);
  const totalQuiz = data.certs.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.topics.reduce((e, t) => e + t.quiz.length, 0), 0), 0);

  if (selCert) {
    const live = data.certs.find(c => c.id === selCert.id) || selCert;
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background-primary)" }}>
        <div style={{ borderBottom: "1px solid var(--color-border-tertiary)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, background: "var(--color-background-primary)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSelCert(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#FF9900", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}>← GrowthDesk</button>
            <span style={{ color: "var(--color-text-secondary)" }}>›</span>
            <span style={{ fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}>{live.title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {syncing && <span style={{ fontSize: 12, color: "#FF9900" }}>⟳ Syncing...</span>}
            {!syncing && lastSynced && editMode && <span style={{ fontSize: 12, color: "#4CAF50" }}>✓ Saved</span>}
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: editMode ? "#FFF3E0" : "var(--color-background-secondary)", color: editMode ? "#FF9900" : "var(--color-text-secondary)", fontWeight: 600 }}>
              {editMode ? "✏️ Edit Mode" : "👁️ Read Only"}
            </span>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 48px 80px" }}>
          <CertView cert={live} onUpdate={updateCert} editMode={editMode} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-primary)" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .cert-card { transition: transform 0.2s, box-shadow 0.2s; }
        .cert-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

      <nav style={{ borderBottom: "1px solid var(--color-border-tertiary)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, background: "var(--color-background-primary)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #FF9900, #e67e00)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16 }}>G</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--color-text-primary)" }}>GrowthDesk</span>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: editMode ? "#FFF3E0" : "var(--color-background-secondary)", color: editMode ? "#FF9900" : "var(--color-text-secondary)", fontWeight: 600 }}>
            {editMode ? "✏️ Edit Mode" : "👁️ Read Only"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {syncing && <span style={{ fontSize: 12, color: "#FF9900" }}>⟳ Syncing...</span>}
          {!syncing && lastSynced && editMode && <span style={{ fontSize: 12, color: "#4CAF50" }}>✓ Synced</span>}
          {editMode && <ExportImport data={data} onImport={imported => saveData(imported)} />}
          {editMode && <button onClick={() => setAddingCert(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #FF9900, #e67e00)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ New Subject</button>}
        </div>
      </nav>

      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "56px 32px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,153,0,0.15)", border: "1px solid rgba(255,153,0,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#FF9900", fontWeight: 500 }}>✦ Personal Research & Study Hub</span>
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
          Everything you learn,<br />
          <span style={{ background: "linear-gradient(90deg, #FF9900, #ffcc66)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>organized in one place.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Research a topic, capture your notes, build mental models, and quiz yourself.
        </p>
        <div style={{ display: "inline-flex", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
          {[{ value: data.certs.length, label: "Subjects" }, { value: totalDomains, label: "Domains" }, { value: totalTopics, label: "Topics" }, { value: totalQuiz, label: "Quizzes" }].map((s, i) => (
            <div key={i} style={{ padding: "14px 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#FF9900" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>Your Subjects</h2>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{data.certs.length} subject{data.certs.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {data.certs.map((cert, idx) => {
            const topicCount = cert.domains.reduce((a, d) => a + d.topics.length, 0);
            const quizCount = cert.domains.reduce((a, d) => a + d.topics.reduce((b, t) => b + t.quiz.length, 0), 0);
            return (
              <div key={cert.id} className="cert-card" style={{ animation: `fadeUp 0.4s ease ${idx * 0.05}s both` }}>
                <button onClick={() => setSelCert(cert)} style={{ width: "100%", textAlign: "left", borderRadius: 14, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", cursor: "pointer", overflow: "hidden", fontFamily: "inherit", padding: 0 }}>
                  <div style={{ background: `linear-gradient(135deg, ${cert.color}22, ${cert.color}08)`, borderBottom: `1px solid ${cert.color}22`, padding: "20px 20px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 36 }}>{cert.icon}</span>
                      <Tag color={cert.color}>{cert.code}</Tag>
                    </div>
                    <h3 style={{ margin: "10px 0 4px", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)" }}>{cert.title}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{cert.description}</p>
                  </div>
                  <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      {[{ v: cert.domains.length, l: "Domains" }, { v: topicCount, l: "Topics" }, { v: quizCount, l: "Quizzes" }].map((s, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: cert.color }}>{s.v}</p>
                          <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>{s.l}</p>
                        </div>
                      ))}
                    </div>
                    <span style={{ color: cert.color, fontSize: 18 }}>→</span>
                  </div>
                </button>
                {editMode && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <button onClick={() => saveData({ ...data, certs: data.certs.filter(c => c.id !== cert.id) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "inherit", padding: "2px 4px" }}>🗑️ remove</button>
                  </div>
                )}
              </div>
            );
          })}
          {editMode && (
            <button onClick={() => setAddingCert(true)} style={{ borderRadius: 14, border: "2px dashed var(--color-border-tertiary)", background: "transparent", cursor: "pointer", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", minHeight: 180 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: "2px dashed var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--color-text-secondary)" }}>+</div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>Add new subject</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)", opacity: 0.7 }}>AWS, Azure, coding, anything</p>
            </button>
          )}
        </div>
        {editMode && addingCert && (
          <NewCertForm onSave={c => { saveData({ ...data, certs: [...data.certs, c] }); setAddingCert(false); }} onCancel={() => setAddingCert(false)} />
        )}
        {editMode && (
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>💾 Export your data regularly as a local backup</p>
            <ExportImport data={data} onImport={imported => saveData(imported)} />
          </div>
        )}
      </div>
    </div>
  );
}