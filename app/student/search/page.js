"use client";
import { useState, useMemo } from "react";
import { EVENTS, DEPARTMENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ScholarSearch() {
  const [search, setSearch] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [dept, setDept] = useState("All Departments");

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      if (dept !== "All Departments" && e.department !== dept) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      if (speaker && !e.speaker.toLowerCase().includes(speaker.toLowerCase())) return false;
      return true;
    });
  }, [dept, search, speaker]);

  return (
    <>
      <div className="dashboard-header"><h1>Advanced Search 🔍</h1><p>Search by keyword, speaker, or department</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div><label className="form-label">Keywords</label><input className="form-input" placeholder="e.g. quantum, NLP" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div><label className="form-label">Speaker Name</label><input className="form-input" placeholder="e.g. Prof. Kumar" value={speaker} onChange={e => setSpeaker(e.target.value)} /></div>
        <div><label className="form-label">Department</label><select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>{DEPARTMENTS.map(d => <option key={d}>{d}</option>)}</select></div>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 16, fontFamily: "Inter,sans-serif" }}>{filtered.length} results</p>
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
  );
}
