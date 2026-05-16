"use client";
import { useState, useMemo } from "react";
import { EVENTS, DEPARTMENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const RESEARCH_DOMAINS = ["Quantum Computing", "Machine Learning", "Neuroscience", "Ayurveda", "Computational Linguistics", "Climate Change", "Drone Technology", "Mathematics"];

const RECORDINGS = [
  { id: 101, title: "Advances in Quantum Error Correction — Prof. Arun Kumar", date: "2025-05-10", department: "Dept. of Physics", duration: "1h 45m", views: 423 },
  { id: 102, title: "Introduction to Transformer Architectures — Dr. Priya Sharma", date: "2025-05-05", department: "Dept. of Computer Science", duration: "2h 10m", views: 891 },
  { id: 103, title: "Paninian Grammar & NLP — Prof. Amba Kulkarni", date: "2025-04-28", department: "Dept. of Sanskrit", duration: "1h 20m", views: 234 },
];

export default function ScholarDashboard() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [speaker, setSpeaker] = useState("");
  const [tab, setTab] = useState("feed");
  const [saved, setSaved] = useState(new Set([4, 5, 10]));

  const toggleSave = (id) => {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const crossDeptEvents = EVENTS.filter(e => e.faculty !== "Institute of Technology");

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      if (dept !== "All Departments" && e.department !== dept) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (speaker && !e.speaker.toLowerCase().includes(speaker.toLowerCase())) return false;
      if (domain && !e.tags.some(t => t.toLowerCase().includes(domain.toLowerCase()))) return false;
      return true;
    });
  }, [dept, search, speaker, domain]);

  return (
    <>
      <div className="dashboard-header">
        <h1>Research Scholar Hub 🔬</h1>
        <p>Discover research events across all departments and domains</p>
      </div>

      <div className="stats-grid">
        {[
          { value: saved.size, label: "Saved Events", color: "#8b5cf6", icon: "⭐" },
          { value: RECORDINGS.length, label: "Recordings Available", color: "#06b6d4", icon: "🎬" },
          { value: EVENTS.length, label: "Upcoming Events", color: "#10b981", icon: "📅" },
          { value: "8", label: "Departments Following", color: "#f59e0b", icon: "🏛️" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
              <div style={{ fontSize: "2rem", opacity: 0.5 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {["feed", "advanced search", "cross-department", "recordings"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={tab === t ? { background: "#8b5cf6" } : {}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <>
          <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 12 }}>🔬 Research Domains</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {RESEARCH_DOMAINS.map(d => (
              <span key={d} className={`filter-chip ${domain === d ? "active" : ""}`} onClick={() => setDomain(domain === d ? "" : d)}>{d}</span>
            ))}
          </div>
          <div className="activity-list">
            {(domain ? EVENTS.filter(e => e.tags.some(t => t.toLowerCase().includes(domain.toLowerCase()))) : EVENTS).map(e => (
              <div key={e.id} className="activity-item">
                <div className="activity-dot" style={{ background: e.color }} />
                <div className="activity-content">
                  <div className="activity-title">{e.title}</div>
                  <div className="activity-meta">🎤 {e.speaker} · {fmtDate(e.date)} · {e.department}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className={`event-card-bookmark ${saved.has(e.id) ? "active" : ""}`}
                    style={{ position: "static", width: 32, height: 32, fontSize: "0.9rem" }}
                    onClick={() => toggleSave(e.id)}>
                    {saved.has(e.id) ? "★" : "☆"}
                  </button>
                  <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "advanced search" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div>
              <label className="form-label">Search Keywords</label>
              <input className="form-input" placeholder="e.g. quantum, NLP, climate" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Speaker Name</label>
              <input className="form-input" placeholder="e.g. Prof. Kumar" value={speaker} onChange={e => setSpeaker(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Department</label>
              <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16, fontFamily: "Inter,sans-serif" }}>{filtered.length} events found</p>
          <div className="activity-list">
            {filtered.map(e => (
              <div key={e.id} className="activity-item">
                <div className="activity-dot" style={{ background: e.color }} />
                <div className="activity-content">
                  <div className="activity-title">{e.title}</div>
                  <div className="activity-meta">🎤 {e.speaker} · {fmtDate(e.date)} · {e.department}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {e.tags.map(t => <span key={t} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 50, background: "rgba(139,92,246,0.15)", color: "#8b5cf6", fontFamily: "Inter,sans-serif" }}>{t}</span>)}
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm">📥 Export ICS</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "cross-department" && (
        <>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Discover events outside your primary department. Break the silos!</p>
          <div className="events-grid">
            {crossDeptEvents.slice(0, 6).map(e => (
              <div key={e.id} className="event-card">
                <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 100 }}>
                  <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                  <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
                  <p className="event-card-desc">{e.description}</p>
                  <div className="event-card-meta">
                    <span className="event-card-dept">🏛️ {e.faculty}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleSave(e.id)}>
                      {saved.has(e.id) ? "★ Saved" : "☆ Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "recordings" && (
        <>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Access recordings and materials from past events</p>
          <div className="activity-list">
            {RECORDINGS.map(r => (
              <div key={r.id} className="activity-item">
                <div style={{ fontSize: "1.5rem" }}>🎬</div>
                <div className="activity-content">
                  <div className="activity-title">{r.title}</div>
                  <div className="activity-meta">{fmtDate(r.date)} · {r.department} · ⏱️ {r.duration} · 👁️ {r.views} views</div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ background: "#8b5cf6" }}>▶ Watch</button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
