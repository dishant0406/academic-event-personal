"use client";
import { useState, useMemo } from "react";
import { EVENTS, EVENT_TYPES, DEPARTMENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudentDiscover() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(new Set());

  const filtered = useMemo(() => {
    return EVENTS.filter(e => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (deptFilter !== "All Departments" && e.department !== deptFilter) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    });
  }, [typeFilter, deptFilter, search]);

  return (
    <>
      <div className="dashboard-header">
        <h1>Discover Events 🔍</h1>
        <p>Browse all academic events across the university</p>
      </div>
      <div className="navbar-search" style={{ maxWidth: 500, padding: "12px 18px", marginBottom: 20 }}>
        <span>🔍</span>
        <input placeholder="Search by title, tag, or keyword…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%" }} />
      </div>
      <div className="filters-bar">
        {EVENT_TYPES.map(t => (
          <button key={t.value} className={`filter-chip ${typeFilter === t.value ? "active" : ""}`} onClick={() => setTypeFilter(t.value)}>{t.label}</button>
        ))}
        <select className="form-select" style={{ maxWidth: 220, padding: "8px 14px", fontSize: "0.82rem", borderRadius: 50 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
          <p>No events match your filters.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map(e => (
            <div key={e.id} className="event-card">
              <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 120 }}>
                <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                <button className={`event-card-bookmark ${bookmarks.has(e.id) ? "active" : ""}`}
                  onClick={() => setBookmarks(prev => { const n = new Set(prev); n.has(e.id) ? n.delete(e.id) : n.add(e.id); return n; })}>
                  {bookmarks.has(e.id) ? "★" : "☆"}
                </button>
              </div>
              <div className="event-card-body">
                <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
                <p className="event-card-desc">{e.description}</p>
                <div className="event-card-meta">
                  <span className="event-card-dept">🏫 {e.department}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "Inter,sans-serif" }}>{e.registrations}+ joined</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
