import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "growthdesk_v1";

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
              notes: [
                "<p>Cloud computing is <strong>on-demand delivery</strong> of IT resources over the internet with <strong>pay-as-you-go pricing</strong>.</p>",
                "<p>Three deployment models:</p><ul><li><strong>Public Cloud</strong> (AWS)</li><li><strong>Private Cloud</strong> (on-premises)</li><li><strong>Hybrid Cloud</strong> (both)</li></ul>",
                "<p>Three service models:</p><ul><li><strong>IaaS</strong> — you manage OS and above</li><li><strong>PaaS</strong> — you manage apps and above</li><li><strong>SaaS</strong> — you just use the app</li></ul>"
              ],
              mentalModels: [
                "🧠 Think of IaaS as renting a car (you drive), PaaS as a taxi (driver provided), SaaS as a bus (fixed route).",
                "🧠 CapEx vs OpEx: Cloud moves you from buying equipment (CapEx) to paying for usage (OpEx)."
              ],
              refs: [{ label: "AWS Cloud Computing Overview", url: "https://aws.amazon.com/what-is-cloud-computing/" }],
              quiz: [
                { q: "What does 'pay-as-you-go' mean in AWS?", options: ["Pay once for unlimited usage", "Pay only for what you consume", "Pay monthly flat fee", "Pay per user"], answer: 1, explanation: "AWS charges only for services you actually use, with no upfront costs." },
                { q: "Which deployment model combines on-premises with cloud?", options: ["Public", "Private", "Hybrid", "Community"], answer: 2, explanation: "Hybrid cloud connects on-premises infrastructure with cloud resources." }
              ]
            },
            {
              id: "t2", name: "AWS Global Infrastructure",
              notes: [
                "<p>AWS operates in <strong>Regions</strong> (geographic areas), each containing multiple <strong>Availability Zones (AZs)</strong>.</p>",
                "<p>AZs are <strong>isolated data centers</strong> within a Region — typically <strong>3-6 per Region</strong>.</p>",
                "<p><strong>Edge Locations</strong> serve cached content via CloudFront CDN — there are <strong>400+ worldwide</strong>.</p>"
              ],
              mentalModels: [
                "🧠 Region = City, AZ = Separate buildings in that city, Edge Location = Delivery trucks worldwide.",
                "🧠 Choose a Region based on: Compliance, Latency, Service availability, Pricing."
              ],
              refs: [{ label: "AWS Global Infrastructure", url: "https://aws.amazon.com/about-aws/global-infrastructure/" }],
              quiz: [
                { q: "What is an AWS Region?", options: ["A single data center", "A group of AZs in a geographic area", "A CDN endpoint", "A VPC boundary"], answer: 1, explanation: "A Region is a physical location with multiple isolated Availability Zones." }
              ]
            }
          ]
        },
        {
          id: "d2", name: "Security & Compliance", weight: "30%",
          topics: [
            {
              id: "t3", name: "Shared Responsibility Model",
              notes: [
                "<p>AWS is responsible for security <strong>OF</strong> the cloud (hardware, software, networking, facilities).</p>",
                "<p>Customer is responsible for security <strong>IN</strong> the cloud (data, identity, OS config, network config).</p>"
              ],
              mentalModels: [
                "🧠 Think of it as an apartment: AWS maintains the building. You secure your unit.",
                "🧠 Higher abstraction (SaaS > PaaS > IaaS) = more AWS responsibility."
              ],
              refs: [{ label: "Shared Responsibility Model", url: "https://aws.amazon.com/compliance/shared-responsibility-model/" }],
              quiz: [
                { q: "Who patches the guest OS on EC2?", options: ["AWS", "The customer", "Both equally", "Neither"], answer: 1, explanation: "With EC2 (IaaS), the customer manages the guest OS including patching." }
              ]
            },
            {
              id: "t4", name: "IAM — Identity & Access Management",
              notes: [
                "<p>IAM manages <strong>who</strong> (authentication) can do <strong>what</strong> (authorization) in your AWS account.</p>",
                "<p>Key components:</p><ul><li><strong>Users</strong> — individual identities</li><li><strong>Groups</strong> — collection of users</li><li><strong>Roles</strong> — temporary access</li><li><strong>Policies</strong> — permission documents</li></ul>",
                "<p><strong>Best practices:</strong></p><ul><li>Use least privilege</li><li>Enable MFA</li><li>Never use root for daily tasks</li></ul>"
              ],
              mentalModels: [
                "🧠 IAM Policy = a permission slip. Attach it to Users, Groups, or Roles.",
                "🧠 Roles are for temporary access — EC2, Lambda, and cross-account access use Roles, not passwords."
              ],
              refs: [{ label: "IAM Documentation", url: "https://docs.aws.amazon.com/iam/latest/userguide/" }],
              quiz: [
                { q: "Best practice for daily AWS administration?", options: ["Use root account", "IAM user with admin policy", "IAM user with least privilege + MFA", "Share credentials"], answer: 2, explanation: "Always use IAM users with least privilege and enable MFA." }
              ]
            }
          ]
        },
        {
          id: "d3", name: "Cloud Technology & Services", weight: "34%",
          topics: [
            {
              id: "t5", name: "Core Compute Services",
              notes: [
                "<p><strong>EC2</strong>: Virtual machines in the cloud — full OS control.</p>",
                "<p><strong>Lambda</strong>: Serverless compute — run code without managing servers. Pay per invocation.</p>",
                "<p><strong>Elastic Beanstalk</strong>: PaaS — upload code, AWS handles capacity, load balancing, scaling.</p>"
              ],
              mentalModels: [
                "🧠 EC2 = Rent a server. Lambda = Rent a function. Beanstalk = Rent a platform.",
                "🧠 Choose Lambda for event-driven, short-lived tasks. EC2 for long-running, custom workloads."
              ],
              refs: [{ label: "EC2 Overview", url: "https://aws.amazon.com/ec2/" }],
              quiz: [
                { q: "Which service runs code without managing servers?", options: ["EC2", "ECS", "Lambda", "Lightsail"], answer: 2, explanation: "AWS Lambda is serverless — you upload code and AWS runs it on demand." }
              ]
            }
          ]
        },
        {
          id: "d4", name: "Billing & Pricing", weight: "12%",
          topics: [
            {
              id: "t6", name: "AWS Pricing Models",
              notes: [
                "<p><strong>On-Demand</strong>: Pay per hour/second, no commitment. Most flexible, most expensive.</p>",
                "<p><strong>Reserved Instances</strong>: 1 or 3 year commitment — up to <strong>72% savings</strong> vs On-Demand.</p>",
                "<p><strong>Spot Instances</strong>: Bid on unused capacity — up to <strong>90% savings</strong>, but can be interrupted.</p>"
              ],
              mentalModels: [
                "🧠 On-Demand = hotel (pay nightly). Reserved = lease (commit, save). Spot = last-minute deal (cheap but risky).",
                "🧠 Use Reserved for predictable baseline. Use Spot for fault-tolerant batch jobs."
              ],
              refs: [{ label: "AWS Pricing Overview", url: "https://aws.amazon.com/pricing/" }],
              quiz: [
                { q: "Which pricing offers up to 90% discount but may be interrupted?", options: ["On-Demand", "Reserved", "Spot", "Dedicated"], answer: 2, explanation: "Spot Instances use spare EC2 capacity at steep discounts but can be reclaimed by AWS." }
              ]
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
              notes: [
                "<p><strong>AI</strong>: Machines simulating human intelligence. <strong>ML</strong>: Systems that learn from data.</p>",
                "<p>Types of ML:</p><ul><li><strong>Supervised</strong> — labeled data</li><li><strong>Unsupervised</strong> — find patterns</li><li><strong>Reinforcement</strong> — reward-based</li></ul>"
              ],
              mentalModels: [
                "🧠 AI ⊃ ML ⊃ Deep Learning — each is a subset of the previous.",
                "🧠 Supervised = Teacher gives answers. Unsupervised = Student finds patterns. Reinforcement = Dog learns via treats."
              ],
              refs: [{ label: "AWS ML Concepts", url: "https://aws.amazon.com/what-is/machine-learning/" }],
              quiz: [
                { q: "Which type of ML uses labeled training data?", options: ["Unsupervised", "Reinforcement", "Supervised", "Generative"], answer: 2, explanation: "Supervised learning uses labeled examples to train models." }
              ]
            }
          ]
        },
        {
          id: "a2", name: "Generative AI Concepts", weight: "24%",
          topics: [
            {
              id: "a2t1", name: "Foundation Models & LLMs",
              notes: [
                "<p><strong>Foundation Models (FMs)</strong>: Large models trained on vast data, adaptable to many tasks.</p>",
                "<p><strong>LLMs</strong>: FMs specialized for text — GPT, Claude, Titan are examples.</p>",
                "<p><strong>Prompt Engineering</strong>: Crafting inputs to get better outputs without retraining.</p>"
              ],
              mentalModels: [
                "🧠 FM = Swiss Army knife — one base model, many uses.",
                "🧠 Prompt = the instructions you give the model. Better prompt = better output."
              ],
              refs: [{ label: "Amazon Bedrock Overview", url: "https://aws.amazon.com/bedrock/" }],
              quiz: [
                { q: "What is Amazon Bedrock?", options: ["A database service", "Managed access to foundation models via API", "An EC2 type", "A container service"], answer: 1, explanation: "Amazon Bedrock provides serverless access to foundation models via a single API." }
              ]
            }
          ]
        },
        {
          id: "a3", name: "AWS AI & ML Services", weight: "28%",
          topics: [
            {
              id: "a3t1", name: "Key AWS AI Services",
              notes: [
                "<p><strong>Amazon Rekognition</strong>: Image/video analysis — face detection, object recognition.</p>",
                "<p><strong>Amazon Comprehend</strong>: NLP — sentiment analysis, entity recognition.</p>",
                "<p><strong>Amazon Textract</strong>: Extract text and data from scanned documents.</p>",
                "<p><strong>Amazon SageMaker</strong>: End-to-end ML platform — build, train, and deploy ML models.</p>"
              ],
              mentalModels: [
                "🧠 Rekognition = eyes. Comprehend = brain for text. Polly = mouth. Transcribe = ears.",
                "🧠 Pre-built AI services need no ML expertise. SageMaker is for custom model development."
              ],
              refs: [{ label: "AWS AI Services", url: "https://aws.amazon.com/machine-learning/ai-services/" }],
              quiz: [
                { q: "Which AWS service analyzes images?", options: ["Comprehend", "Rekognition", "Textract", "Polly"], answer: 1, explanation: "Amazon Rekognition provides image and video analysis including object detection." }
              ]
            }
          ]
        }
      ]
    }
  ]
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

function useData() {
  const [data, setData] = useState(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setData(saved ? JSON.parse(saved) : defaultData);
    } catch { setData(defaultData); }
  }, []);
  const save = (newData) => {
    setData(newData);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newData)); } catch {}
  };
  return [data, save];
}

// ── Rich Text Styles ───────────────────────────────────────────
const richTextCSS = `
  .rich-editor, .rich-view {
    font-size: 14px;
    line-height: 1.8;
    color: var(--color-text-primary);
    text-align: left;
    font-family: inherit;
  }
  .rich-editor:empty:before { content: attr(data-placeholder); color: #888; pointer-events: none; }
  .rich-editor { min-height: 140px; padding: 12px 14px; outline: none; }
  .rich-view, .rich-editor {
    word-break: break-word;
  }
  .rich-view h3, .rich-editor h3 { font-size: 17px; font-weight: 700; margin: 16px 0 6px; color: var(--color-text-primary); text-align: left; }
  .rich-view h4, .rich-editor h4 { font-size: 15px; font-weight: 600; margin: 12px 0 4px; color: var(--color-text-primary); text-align: left; }
  .rich-view p, .rich-editor p { margin: 6px 0; text-align: left; }
  .rich-view ul, .rich-editor ul { list-style: disc; padding-left: 22px; margin: 6px 0; text-align: left; }
  .rich-view ol, .rich-editor ol { list-style: decimal; padding-left: 22px; margin: 6px 0; text-align: left; }
  .rich-view li, .rich-editor li { margin: 4px 0; padding-left: 4px; text-align: left; }
  .rich-view ul ul, .rich-editor ul ul { list-style: circle; padding-left: 20px; margin: 2px 0; }
  .rich-view ul ul ul, .rich-editor ul ul ul { list-style: square; padding-left: 20px; }
  .rich-view strong, .rich-editor strong { font-weight: 700; }
  .rich-view em, .rich-editor em { font-style: italic; }
  .rich-view u, .rich-editor u { text-decoration: underline; }
  .rich-view hr, .rich-editor hr { border: none; border-top: 1px solid var(--color-border-tertiary); margin: 12px 0; }
  .rich-view blockquote, .rich-editor blockquote { border-left: 3px solid #FF9900; padding: 6px 12px; margin: 8px 0; background: var(--color-background-secondary); border-radius: 0 6px 6px 0; font-style: italic; }
  .rich-view code, .rich-editor code { background: var(--color-background-secondary); padding: 1px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
`;

// ── Rich Text Editor ───────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || "";
      isInitialized.current = true;
    }
  }, []);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const tools = [
    { label: "B", cmd: "bold", style: { fontWeight: "bold" }, title: "Bold" },
    { label: "I", cmd: "italic", style: { fontStyle: "italic" }, title: "Italic" },
    { label: "U", cmd: "underline", style: { textDecoration: "underline" }, title: "Underline" },
    { label: "H1", cmd: "formatBlock", val: "h3", title: "Heading 1" },
    { label: "H2", cmd: "formatBlock", val: "h4", title: "Heading 2" },
    { label: "¶", cmd: "formatBlock", val: "p", title: "Paragraph" },
    { label: "❝", cmd: "formatBlock", val: "blockquote", title: "Quote" },
    { label: "• List", cmd: "insertUnorderedList", title: "Bullet list" },
    { label: "1. List", cmd: "insertOrderedList", title: "Numbered list" },
    { label: "⇥ Indent", cmd: "indent", title: "Indent" },
    { label: "⇤ Outdent", cmd: "outdent", title: "Outdent" },
    { label: "—", cmd: "insertHorizontalRule", title: "Divider" },
  ];

  return (
    <div style={{ border: "1px solid var(--color-border-secondary)", borderRadius: 10, overflow: "hidden" }}>
      <style>{richTextCSS}</style>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, padding: "8px 10px", background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)" }}>
        {tools.map((t, i) => (
          <button key={i} onMouseDown={e => { e.preventDefault(); exec(t.cmd, t.val || null); }} title={t.title}
            style={{ ...t.style, padding: "4px 9px", borderRadius: 5, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        data-placeholder={placeholder}
        className="rich-editor"
      />
    </div>
  );
}

// ── Render rich HTML note ──────────────────────────────────────
function NoteContent({ html }) {
  return (
    <>
      <style>{richTextCSS}</style>
      <div className="rich-view" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

// ── Shared UI ──────────────────────────────────────────────────
const Btn = ({ onClick, children, variant = "ghost", color, style = {} }) => {
  const base = { cursor: "pointer", borderRadius: 8, fontSize: 13, padding: "6px 12px", fontFamily: "inherit" };
  const v = {
    ghost: { background: "transparent", border: "1px solid var(--color-border-tertiary)", color: "var(--color-text-secondary)" },
    primary: { background: color || "#FF9900", border: "none", color: "#fff" },
    danger: { background: "transparent", border: "1px solid #E53935", color: "#C62828" },
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

// ── Quiz ───────────────────────────────────────────────────────
function QuizMode({ questions, onBack }) {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState([]); // array for multi-select
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions.length) return (
    <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-secondary)" }}>
      <p>No quiz questions yet. Add some below!</p>
    </div>
  );

  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>{score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "📚"}</div>
      <h3 style={{ color: "var(--color-text-primary)", marginBottom: 4 }}>Score: {score} / {questions.length}</h3>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        <Btn onClick={() => { setCur(0); setSel([]); setSubmitted(false); setScore(0); setDone(false); }}>Retry</Btn>
        <Btn onClick={onBack} variant="primary">← Back</Btn>
      </div>
    </div>
  );

  const q = questions[cur];
  const isMulti = q.type === "multi";
  const isExplain = q.type === "explain";
  const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];

  const toggleOption = (i) => {
    if (submitted) return;
    if (isMulti) {
      setSel(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
    } else {
      setSel([i]);
    }
  };

  const handleSubmit = () => {
    if (sel.length === 0 && !isExplain) return;
    setSubmitted(true);
    const isCorrect = isMulti
      ? correctAnswers.length === sel.length && correctAnswers.every(a => sel.includes(a))
      : sel[0] === correctAnswers[0];
    if (isCorrect) setScore(s => s + 1);
  };

  const next = () => {
    if (cur + 1 >= questions.length) setDone(true);
    else { setCur(c => c + 1); setSel([]); setSubmitted(false); }
  };

  const getOptionStyle = (i) => {
    const base = { textAlign: "left", padding: "10px 14px", borderRadius: 8, cursor: submitted ? "default" : "pointer", fontSize: 14, fontFamily: "inherit", width: "100%", marginBottom: 6 };
    if (!submitted) {
      const chosen = sel.includes(i);
      return { ...base, background: chosen ? "rgba(255,153,0,0.1)" : "var(--color-background-primary)", border: `1px solid ${chosen ? "#FF9900" : "var(--color-border-tertiary)"}`, color: "var(--color-text-primary)" };
    }
    const isCorrect = correctAnswers.includes(i);
    const isChosen = sel.includes(i);
    if (isCorrect) return { ...base, background: "#E8F5E9", border: "1px solid #4CAF50", color: "#2E7D32" };
    if (isChosen && !isCorrect) return { ...base, background: "#FFEBEE", border: "1px solid #E53935", color: "#C62828" };
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

      {/* Question type badge */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: isExplain ? "#E8F0FE" : isMulti ? "#F3E5F5" : "#FFF3E0", color: isExplain ? "#1A73E8" : isMulti ? "#7B2D8B" : "#FF9900", fontWeight: 500 }}>
          {isExplain ? "📖 Explanation" : isMulti ? "☑️ Multiple Select" : "🔘 Single Choice"}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}><NoteContent html={q.q} /></div>

      {!isExplain && (
        <div style={{ marginBottom: 12 }}>
          {isMulti && <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>Select all that apply</p>}
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => toggleOption(i)} style={getOptionStyle(i)}>
              <span style={{ marginRight: 8 }}>{isMulti ? (sel.includes(i) ? "☑" : "☐") : String.fromCharCode(65 + i) + "."}</span>
              {opt}
              {submitted && correctAnswers.includes(i) && <span style={{ marginLeft: 6 }}>✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Submit button */}
      {!submitted && !isExplain && (
        <button onClick={handleSubmit} disabled={sel.length === 0} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: sel.length > 0 ? "#FF9900" : "var(--color-background-secondary)", color: sel.length > 0 ? "#fff" : "var(--color-text-secondary)", fontSize: 14, cursor: sel.length > 0 ? "pointer" : "default", fontFamily: "inherit", fontWeight: 500, marginBottom: 10 }}>
          Submit Answer
        </button>
      )}

      {/* Explanation */}
      {(submitted || isExplain) && q.explanation && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px", marginBottom: 12, borderLeft: "3px solid #FF9900" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#FF9900" }}>💡 EXPLANATION</p>
          <NoteContent html={q.explanation} />
        </div>
      )}

      {(submitted || isExplain) && (
        <button onClick={next} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "#FF9900", color: "#fff", fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>
          {cur + 1 >= questions.length ? "See results" : "Next →"}
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
  const [multiAnswers, setMultiAnswers] = useState(
    initial?.type === "multi" && Array.isArray(initial?.answer) ? initial.answer : []
  );

  const isExplain = form.type === "explain";
  const isMulti = form.type === "multi";
  const valid = qHtml.replace(/<[^>]*>/g, "").trim().length > 0;

  const handleSave = () => {
    if (!valid) return;
    const answer = isMulti ? multiAnswers : isExplain ? null : form.answer;
    onSave({ ...form, q: qHtml, explanation: expHtml, answer, type: form.type });
  };

  return (
    <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
      {/* Question type selector */}
      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>QUESTION TYPE</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[
          { id: "single", label: "🔘 Single Choice" },
          { id: "multi", label: "☑️ Multiple Select" },
          { id: "explain", label: "📖 Explanation Only" },
        ].map(t => (
          <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${form.type === t.id ? "#FF9900" : "var(--color-border-tertiary)"}`, background: form.type === t.id ? "#FFF3E0" : "transparent", color: form.type === t.id ? "#FF9900" : "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: form.type === t.id ? 600 : 400 }}>{t.label}</button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>QUESTION / CONTENT</p>
      <RichEditor value={qHtml} onChange={setQHtml} placeholder={isExplain ? "Write your explanation, concept, or study note here..." : "Enter your question..."} />

      {/* Options — only for single/multi */}
      {!isExplain && (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            OPTIONS — <span style={{ fontWeight: 400 }}>{isMulti ? "check all correct answers" : "select the one correct answer"}</span>
          </p>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              {isMulti ? (
                <input type="checkbox" checked={multiAnswers.includes(i)} onChange={() => setMultiAnswers(a => a.includes(i) ? a.filter(x => x !== i) : [...a, i])} style={{ accentColor: "#FF9900", flexShrink: 0, width: 16, height: 16 }} />
              ) : (
                <input type="radio" checked={form.answer === i} onChange={() => setForm(f => ({ ...f, answer: i }))} style={{ accentColor: "#FF9900", flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)", minWidth: 20 }}>{String.fromCharCode(65 + i)}.</span>
              <Input value={opt} onChange={v => setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o }; })} placeholder={`Option ${String.fromCharCode(65 + i)}`} style={{ marginBottom: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Explanation — optional */}
      <div style={{ marginTop: 14 }}>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>EXPLANATION <span style={{ fontWeight: 400, opacity: 0.7 }}>(optional)</span></p>
        <RichEditor value={expHtml} onChange={setExpHtml} placeholder="Explain the answer or add extra context — optional..." />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <Btn onClick={handleSave} variant="primary" color="#FF9900" style={{ opacity: valid ? 1 : 0.5 }}>Save question</Btn>
        <Btn onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Topic View ─────────────────────────────────────────────────
function TopicView({ topic, certColor, onBack, onUpdate }) {
  const [tab, setTab] = useState("notes");
  const [addingNote, setAddingNote] = useState(false);
  const [addingMM, setAddingMM] = useState(false);
  const [addingRef, setAddingRef] = useState(false);
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [editingNoteIdx, setEditingNoteIdx] = useState(null);
  const [editingMMIdx, setEditingMMIdx] = useState(null);
  const [editingQuizIdx, setEditingQuizIdx] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [newMM, setNewMM] = useState("");
  const [newRef, setNewRef] = useState({ label: "", url: "" });
  const [editNoteVal, setEditNoteVal] = useState("");
  const [editMMVal, setEditMMVal] = useState("");

  const update = (patch) => onUpdate({ ...topic, ...patch });

  const tabs = [
    { id: "notes", label: "📖 Notes", count: topic.notes.length },
    { id: "mental", label: "🧠 Mental Models", count: topic.mentalModels.length },
    { id: "quiz", label: "📝 Quiz", count: topic.quiz.length },
    { id: "refs", label: "🔗 References", count: topic.refs.length },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--color-border-tertiary)", gap: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: certColor, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← Back</button>
        <h2 style={{ color: "var(--color-text-primary)", fontSize: 15, margin: 0, flex: 1, textAlign: "center" }}>{topic.name}</h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: "1px solid var(--color-border-tertiary)", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${tab === t.id ? certColor : "var(--color-border-tertiary)"}`, background: tab === t.id ? certColor : "transparent", color: tab === t.id ? "#fff" : "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* NOTES TAB */}
        {tab === "notes" && (
          <div>
            {topic.notes.map((n, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                {editingNoteIdx === i ? (
                  <div>
                    <RichEditor value={editNoteVal} onChange={setEditNoteVal} placeholder="Edit your note..." />
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <Btn variant="primary" color={certColor} onClick={() => { const notes = [...topic.notes]; notes[i] = editNoteVal; update({ notes }); setEditingNoteIdx(null); }}>Save</Btn>
                      <Btn onClick={() => setEditingNoteIdx(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderLeft: `3px solid ${certColor}`, background: "var(--color-background-secondary)", borderRadius: "0 8px 8px 0", padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <NoteContent html={n} />
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => { setEditingNoteIdx(i); setEditNoteVal(n); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                        <button onClick={() => update({ notes: topic.notes.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addingNote ? (
              <div style={{ marginTop: 10 }}>
                <RichEditor value={newNote} onChange={setNewNote} placeholder="Write your note — use toolbar to format..." />
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Btn variant="primary" color={certColor} onClick={() => { if (newNote.trim()) { update({ notes: [...topic.notes, newNote] }); setNewNote(""); setAddingNote(false); } }}>Add note</Btn>
                  <Btn onClick={() => { setAddingNote(false); setNewNote(""); }}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingNote(true)} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add note</button>
            )}
          </div>
        )}

        {/* MENTAL MODELS TAB */}
        {tab === "mental" && (
          <div>
            {topic.mentalModels.map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                {editingMMIdx === i ? (
                  <div>
                    <RichEditor value={editMMVal} onChange={setEditMMVal} placeholder="Describe your mental model..." />
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <Btn variant="primary" color={certColor} onClick={() => { const mm = [...topic.mentalModels]; mm[i] = editMMVal; update({ mentalModels: mm }); setEditingMMIdx(null); }}>Save</Btn>
                      <Btn onClick={() => setEditingMMIdx(null)}>Cancel</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "12px 14px", border: `1px solid var(--color-border-tertiary)`, borderLeft: `3px solid ${certColor}`, borderRadius: 10, background: "var(--color-background-secondary)" }}>
                    <div style={{ flex: 1 }}><NoteContent html={m} /></div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditingMMIdx(i); setEditMMVal(m); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                      <button onClick={() => update({ mentalModels: topic.mentalModels.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addingMM ? (
              <div style={{ marginTop: 10 }}>
                <RichEditor value={newMM} onChange={setNewMM} placeholder="e.g. 🧠 Think of X as Y — use formatting to make it memorable..." />
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <Btn variant="primary" color={certColor} onClick={() => { if (newMM.trim()) { update({ mentalModels: [...topic.mentalModels, newMM] }); setNewMM(""); setAddingMM(false); } }}>Add</Btn>
                  <Btn onClick={() => { setAddingMM(false); setNewMM(""); }}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingMM(true)} style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add mental model</button>
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {tab === "quiz" && (
          <div>
            {addingQuiz || editingQuizIdx !== null ? (
              <QuizEditor
                initial={editingQuizIdx !== null ? topic.quiz[editingQuizIdx] : null}
                onSave={(q) => {
                  if (editingQuizIdx !== null) { const quiz = [...topic.quiz]; quiz[editingQuizIdx] = q; update({ quiz }); setEditingQuizIdx(null); }
                  else { update({ quiz: [...topic.quiz, q] }); setAddingQuiz(false); }
                }}
                onCancel={() => { setAddingQuiz(false); setEditingQuizIdx(null); }}
              />
            ) : (
              <>
                {topic.quiz.length > 0 && <div style={{ marginBottom: 12 }}><QuizMode questions={topic.quiz} onBack={() => {}} /></div>}
                <div style={{ borderTop: topic.quiz.length > 0 ? "1px solid var(--color-border-tertiary)" : "none", paddingTop: topic.quiz.length > 0 ? 12 : 0 }}>
                  <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>MANAGE QUESTIONS</p>
                  {topic.quiz.map((q, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", border: "1px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 10, background: q.type === "explain" ? "#E8F0FE" : q.type === "multi" ? "#F3E5F5" : "#FFF3E0", color: q.type === "explain" ? "#1A73E8" : q.type === "multi" ? "#7B2D8B" : "#FF9900", fontWeight: 500, marginRight: 6 }}>
                          {q.type === "explain" ? "📖" : q.type === "multi" ? "☑️" : "🔘"}
                        </span>
                        <span style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{q.q.replace(/<[^>]*>/g, "").slice(0, 80)}{q.q.replace(/<[^>]*>/g, "").length > 80 ? "..." : ""}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button onClick={() => setEditingQuizIdx(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                        <button onClick={() => update({ quiz: topic.quiz.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setAddingQuiz(true)} style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add quiz question</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* REFS TAB */}
        {tab === "refs" && (
          <div>
            {topic.refs.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: "1px solid var(--color-border-tertiary)", borderRadius: 8, marginBottom: 8 }}>
                <a href={r.url} target="_blank" rel="noreferrer" style={{ color: certColor, fontSize: 14, flex: 1, textDecoration: "none" }}>🔗 {r.label}</a>
                <button onClick={() => update({ refs: topic.refs.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
              </div>
            ))}
            {addingRef ? (
              <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 10, padding: 12, marginTop: 8 }}>
                <Input value={newRef.label} onChange={v => setNewRef(r => ({ ...r, label: v }))} placeholder="Label (e.g. AWS S3 Documentation)" style={{ marginBottom: 8 }} />
                <Input value={newRef.url} onChange={v => setNewRef(r => ({ ...r, url: v }))} placeholder="URL (https://...)" style={{ marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="primary" color={certColor} onClick={() => { if (newRef.label.trim() && newRef.url.trim()) { update({ refs: [...topic.refs, { ...newRef }] }); setNewRef({ label: "", url: "" }); setAddingRef(false); } }}>Add</Btn>
                  <Btn onClick={() => { setAddingRef(false); setNewRef({ label: "", url: "" }); }}>Cancel</Btn>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingRef(true)} style={{ marginTop: 8, width: "100%", padding: "10px", borderRadius: 8, border: `1px dashed ${certColor}`, background: "transparent", color: certColor, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Add reference</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cert View ──────────────────────────────────────────────────
function CertView({ cert, onBack, onUpdate }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);
  const [addingDomain, setAddingDomain] = useState(false);
  const [addingTopicFor, setAddingTopicFor] = useState(null);
  const [newDomain, setNewDomain] = useState({ name: "", weight: "" });
  const [newTopic, setNewTopic] = useState("");

  const updateTopic = (domainId, updatedTopic) => {
    onUpdate({ ...cert, domains: cert.domains.map(d => d.id !== domainId ? d : { ...d, topics: d.topics.map(t => t.id !== updatedTopic.id ? t : updatedTopic) }) });
  };

  if (selectedTopic) {
    return (
      <TopicView
        topic={selectedTopic}
        certColor={cert.color}
        onBack={() => setSelectedTopic(null)}
        onUpdate={(updated) => { updateTopic(selectedDomainId, updated); setSelectedTopic(updated); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--color-border-tertiary)" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: cert.color, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>← All certs</button>
      </div>
      <div style={{ padding: "16px" }}>
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
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setAddingTopicFor(domain.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: cert.color, fontFamily: "inherit" }}>+ Topic</button>
                <button onClick={() => onUpdate({ ...cert, domains: cert.domains.filter(d => d.id !== domain.id) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>🗑️</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {domain.topics.map(topic => (
                <div key={topic.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => { setSelectedTopic(topic); setSelectedDomainId(domain.id); }} style={{ textAlign: "left", flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-primary)", fontWeight: 500 }}>{topic.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{topic.notes.length} notes · {topic.mentalModels.length} models · {topic.quiz.length} quiz</p>
                    </div>
                    <span style={{ color: cert.color, fontSize: 18 }}>›</span>
                  </button>
                  <button onClick={() => onUpdate({ ...cert, domains: cert.domains.map(d => d.id !== domain.id ? d : { ...d, topics: d.topics.filter(t => t.id !== topic.id) }) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 4 }}>🗑️</button>
                </div>
              ))}
              {addingTopicFor === domain.id && (
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

        {addingDomain ? (
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
        )}
      </div>
    </div>
  );
}

// ── New Cert Form ──────────────────────────────────────────────
function NewCertForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: "", code: "", description: "", icon: "☁️", color: COLORS[0].color, lightColor: COLORS[0].lightColor });
  const valid = form.title.trim() && form.code.trim();
  return (
    <div style={{ border: "1px solid var(--color-border-tertiary)", borderRadius: 12, padding: "16px", marginTop: 16 }}>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 14 }}>New Certification</p>
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

// ── Export / Import ────────────────────────────────────────────
function ExportImport({ data, onImport }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const exportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aws-study-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: "success", text: "✅ Backup downloaded!" });
    setTimeout(() => setMsg(null), 3000);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.certs) throw new Error("Invalid file");
        onImport(parsed);
        setMsg({ type: "success", text: "✅ Data restored successfully!" });
      } catch {
        setMsg({ type: "error", text: "❌ Invalid backup file." });
      }
      setTimeout(() => setMsg(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={exportData} title="Export backup" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
        ⬇️ Export
      </button>
      <button onClick={() => fileRef.current?.click()} title="Import backup" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
        ⬆️ Import
      </button>
      <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
      {msg && (
        <span style={{ fontSize: 12, color: msg.type === "success" ? "#4CAF50" : "#E53935" }}>{msg.text}</span>
      )}
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────
export default function App() {
  const [data, saveData] = useData();
  const [selectedCert, setSelectedCert] = useState(null);
  const [addingCert, setAddingCert] = useState(false);

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--color-text-secondary)", fontSize: 14 }}>
      Loading GrowthDesk...
    </div>
  );

  const updateCert = (updated) => {
    const certs = data.certs.map(c => c.id !== updated.id ? c : updated);
    saveData({ ...data, certs });
    if (selectedCert?.id === updated.id) setSelectedCert(updated);
  };

  const totalTopics = data.certs.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.topics.length, 0), 0);
  const totalDomains = data.certs.reduce((a, c) => a + c.domains.length, 0);
  const totalQuiz = data.certs.reduce((a, c) => a + c.domains.reduce((b, d) => b + d.topics.reduce((e, t) => e + t.quiz.length, 0), 0), 0);

  if (selectedCert) {
    const live = data.certs.find(c => c.id === selectedCert.id) || selectedCert;
    return (
      <div style={{ minHeight: "100vh", background: "var(--color-background-primary)" }}>
        {/* Top nav */}
        <div style={{ borderBottom: "1px solid var(--color-border-tertiary)", padding: "0 32px", display: "flex", alignItems: "center", height: 56, background: "var(--color-background-primary)", position: "sticky", top: 0, zIndex: 10 }}>
          <button onClick={() => setSelectedCert(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", color: "var(--color-text-secondary)", fontSize: 14 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#FF9900" }}>G</span>
            <span style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: 15 }}>GrowthDesk</span>
          </button>
          <span style={{ margin: "0 10px", color: "var(--color-text-secondary)" }}>›</span>
          <span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>{live.title}</span>
        </div>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
          <CertView cert={live} onBack={() => setSelectedCert(null)} onUpdate={updateCert} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-primary)" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .cert-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .cert-card { transition: transform 0.2s, box-shadow 0.2s; }
      `}</style>

      {/* Navbar */}
      <nav style={{ borderBottom: "1px solid var(--color-border-tertiary)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, background: "var(--color-background-primary)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #FF9900, #e67e00)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16 }}>G</div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--color-text-primary)", letterSpacing: "-0.3px" }}>GrowthDesk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ExportImport data={data} onImport={(imported) => saveData(imported)} />
          <button onClick={() => setAddingCert(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #FF9900, #e67e00)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ New Subject</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "56px 32px 48px", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,153,0,0.15)", border: "1px solid rgba(255,153,0,0.3)", borderRadius: 20, padding: "4px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#FF9900", fontWeight: 500 }}>✦ Personal Research & Study Hub</span>
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.5px", lineHeight: 1.2 }}>
          Everything you learn,<br />
          <span style={{ background: "linear-gradient(90deg, #FF9900, #ffcc66)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>organized in one place.</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Research a topic, capture your notes, build mental models, and quiz yourself — all in one growing knowledge base.
        </p>
        {/* Stats */}
        <div style={{ display: "inline-flex", gap: 0, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
          {[
            { value: data.certs.length, label: "Subjects" },
            { value: totalDomains, label: "Domains" },
            { value: totalTopics, label: "Topics" },
            { value: totalQuiz, label: "Quiz Questions" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#FF9900" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subject cards */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
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
                <button onClick={() => setSelectedCert(cert)} style={{ width: "100%", textAlign: "left", borderRadius: 14, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", cursor: "pointer", overflow: "hidden", fontFamily: "inherit", padding: 0 }}>
                  {/* Card header */}
                  <div style={{ background: `linear-gradient(135deg, ${cert.color}22, ${cert.color}08)`, borderBottom: `1px solid ${cert.color}22`, padding: "20px 20px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{ fontSize: 36 }}>{cert.icon}</span>
                      <Tag color={cert.color}>{cert.code}</Tag>
                    </div>
                    <h3 style={{ margin: "10px 0 4px", fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.3 }}>{cert.title}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{cert.description}</p>
                  </div>
                  {/* Card footer */}
                  <div style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 14 }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: cert.color }}>{cert.domains.length}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>Domains</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: cert.color }}>{topicCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>Topics</p>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: cert.color }}>{quizCount}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "var(--color-text-secondary)" }}>Quizzes</p>
                      </div>
                    </div>
                    <span style={{ color: cert.color, fontSize: 18, fontWeight: 300 }}>→</span>
                  </div>
                </button>
                <button onClick={() => saveData({ ...data, certs: data.certs.filter(c => c.id !== cert.id) })} style={{ position: "absolute", display: "none" }} />
                {/* Delete shown on hover via title */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <button onClick={() => saveData({ ...data, certs: data.certs.filter(c => c.id !== cert.id) })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "inherit", padding: "2px 4px" }}>🗑️ remove</button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <button onClick={() => setAddingCert(true)} style={{ borderRadius: 14, border: "2px dashed var(--color-border-tertiary)", background: "transparent", cursor: "pointer", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit", minHeight: 180 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, border: "2px dashed var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--color-text-secondary)" }}>+</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>Add new subject</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)", opacity: 0.7 }}>AWS, Azure, coding, anything</p>
          </button>
        </div>

        {addingCert && (
          <div style={{ marginTop: 24 }}>
            <NewCertForm onSave={(c) => { saveData({ ...data, certs: [...data.certs, c] }); setAddingCert(false); }} onCancel={() => setAddingCert(false)} />
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>💾 Export your data regularly to avoid losing your notes</p>
          <ExportImport data={data} onImport={(imported) => saveData(imported)} />
        </div>
      </div>
    </div>
  );
}
