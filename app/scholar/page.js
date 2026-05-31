"use client";
import { useState, useMemo, useEffect } from "react";
import { fetchApi } from "@/lib/api";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const RESEARCH_DOMAINS = ["Quantum Computing", "Machine Learning", "Neuroscience", "Ayurveda", "Computational Linguistics", "Climate Change", "Drone Technology", "Mathematics"];

export default function ScholarDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [speaker, setSpeaker] = useState("");
  const [tab, setTab] = useState("feed");
  const [saved, setSaved] = useState(new Set());
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {}
      }
      
      try {
        const res = await fetchApi("/events?limit=100");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const toggleSave = (id) => {
    setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const DEPARTMENTS = ["All Departments", ...Array.from(new Set(events.map(e => e.department).filter(Boolean)))];
  
  // A scholar's cross-department events are ones outside their own faculty.
  // We'll just filter out the most common faculty if user doesn't have one, or filter by user.department.
  const userDept = user?.department || "Institute of Technology";
  const crossDeptEvents = events.filter(e => e.faculty !== userDept);

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (dept !== "All Departments" && e.department !== dept) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !(e.tags && e.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))) return false;
      if (speaker && e.speaker && !e.speaker.toLowerCase().includes(speaker.toLowerCase())) return false;
      if (domain && !(e.tags && e.tags.some(t => t.toLowerCase().includes(domain.toLowerCase())))) return false;
      return true;
    });
  }, [events, dept, search, speaker, domain]);

  if (loading) {
     return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "var(--text-secondary)", fontSize: "1.2rem", fontFamily: "Plus Jakarta Sans,sans-serif" }}>Loading Research Feed...</div>;
  }

  return (
    <>
      <div className="dashboard-header">
        <h1>Welcome back, {user ? user.fullName.split(" ")[0] : "Scholar"}! 🔬</h1>
        <p>Discover research events across all departments and domains</p>
      </div>

      <div className="stats-grid">
        {[
          { value: saved.size, label: "Saved Events", color: "#8b5cf6", icon: "⭐" },
          { value: events.length, label: "Upcoming Events", color: "#10b981", icon: "📅" },
          { value: DEPARTMENTS.length - 1, label: "Departments Following", color: "#f59e0b", icon: "🏛️" },
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
        {["feed", "advanced search", "cross-department"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <>
          <h3 style={{ fontFamily: "Plus Jakarta Sans,sans-serif", fontSize: "1rem", marginBottom: 12 }}>🔬 Research Domains</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {RESEARCH_DOMAINS.map(d => (
              <span key={d} className={`filter-chip ${domain === d ? "active" : ""}`} onClick={() => setDomain(domain === d ? "" : d)}>{d}</span>
            ))}
          </div>
          <div className="activity-list">
            {(domain ? events.filter(e => e.tags && e.tags.some(t => t.toLowerCase().includes(domain.toLowerCase()))) : events).map(e => (
              <div key={e._id} className="activity-item">
                <div className="activity-dot" style={{ background: e.color || '#6366f1' }} />
                <div className="activity-content">
                  <div className="activity-title">{e.title}</div>
                  <div className="activity-meta">🎤 {e.speaker || "TBA"} · {fmtDate(e.date)} · {e.department}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className={`event-card-bookmark ${saved.has(e._id) ? "active" : ""}`}
                    style={{ position: "static", width: 32, height: 32, fontSize: "0.9rem" }}
                    onClick={() => toggleSave(e._id)}>
                    {saved.has(e._id) ? "★" : "☆"}
                  </button>
                  <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && <p style={{ color: "var(--text-muted)" }}>No events found.</p>}
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
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16, fontFamily: "Plus Jakarta Sans,sans-serif" }}>{filtered.length} events found</p>
          <div className="activity-list">
            {filtered.map(e => (
              <div key={e._id} className="activity-item">
                <div className="activity-dot" style={{ background: e.color || '#6366f1' }} />
                <div className="activity-content">
                  <div className="activity-title">{e.title}</div>
                  <div className="activity-meta">🎤 {e.speaker || "TBA"} · {fmtDate(e.date)} · {e.department}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {(e.tags || []).map(t => <span key={t} style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 50, background: "rgba(139,92,246,0.15)", color: "#8b5cf6", fontFamily: "Plus Jakarta Sans,sans-serif" }}>{t}</span>)}
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
              <div key={e._id} className="event-card">
                <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color || '#6366f1'}22, ${e.color || '#6366f1'}08)`, height: 100 }}>
                  <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                  <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
                  <p className="event-card-desc">{e.description}</p>
                  <div className="event-card-meta">
                    <span className="event-card-dept">🏛️ {e.faculty || "University Wide"}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleSave(e._id)}>
                      {saved.has(e._id) ? "★ Saved" : "☆ Save"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </>
  );
}
