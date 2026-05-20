"use client";
import { useState, useEffect } from "react";
import { EVENTS, EVENT_TYPES } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const INTERESTS = ["Physics", "Computer Science", "AI/ML", "Mathematics", "Agriculture"];

export default function StudentDashboard() {
  const [bookmarks, setBookmarks] = useState(new Set([1, 5, 9]));
  const [registered, setRegistered] = useState(new Set([2, 5]));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState({ fullName: "Ashish Kumar Panigrahi" });

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.fullName) setUser(parsed);
      } catch (e) {}
    }
  }, []);

  const toggleBookmark = (id) => {
    setBookmarks(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const handleRegister = (id) => {
    setRegistered(prev => new Set(prev).add(id));
    setToast("✅ Successfully registered!");
    setTimeout(() => setToast(null), 3000);
    setSelectedEvent(null);
  };

  const recommended = EVENTS.filter(e => e.tags.some(t => ["physics", "AI", "deep learning", "research", "computer science"].includes(t.toLowerCase())));

  return (
    <>
      <div className="dashboard-header">
        <h1>Welcome back, {user.fullName.split(" ")[0]}! 👋</h1>
        <p>Here&apos;s what&apos;s happening on campus today</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { value: registered.size, label: "Events Registered", color: "#6366f1", icon: "🎫" },
          { value: bookmarks.size, label: "Bookmarked", color: "#f59e0b", icon: "⭐" },
          { value: "3", label: "Certificates Earned", color: "#10b981", icon: "📜" },
          { value: "12", label: "Events Attended", color: "#8b5cf6", icon: "✅" },
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

      {/* My Interests */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Your Interests</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {INTERESTS.map(i => (
            <span key={i} className="filter-chip active">{i}</span>
          ))}
          <span className="filter-chip" style={{ borderStyle: "dashed" }}>+ Add more</span>
        </div>
      </div>

      {/* Recommended Events */}
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>📰 Recommended For You</h3>
      <div className="events-grid" style={{ marginBottom: 40 }}>
        {recommended.slice(0, 4).map(e => (
          <div key={e.id} className="event-card" onClick={() => setSelectedEvent(e)}>
            <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 120 }}>
              <span className={`event-card-type type-${e.type}`}>{e.type}</span>
              <button className={`event-card-bookmark ${bookmarks.has(e.id) ? "active" : ""}`}
                onClick={ev => { ev.stopPropagation(); toggleBookmark(e.id); }}>
                {bookmarks.has(e.id) ? "★" : "☆"}
              </button>
            </div>
            <div className="event-card-body">
              <div className="event-card-date">📅 {fmtDate(e.date)}</div>
              <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
              <div className="event-card-meta">
                <span className="event-card-dept">🏫 {e.department}</span>
                {registered.has(e.id) ? (
                  <span className="status-badge status-approved">Registered</span>
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontFamily: "Inter,sans-serif" }}>RSVP →</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Registered Events */}
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>🎫 Your Upcoming Events</h3>
      <div className="activity-list" style={{ marginBottom: 40 }}>
        {EVENTS.filter(e => registered.has(e.id)).map(e => (
          <div key={e.id} className="activity-item">
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{fmtDate(e.date)} · {e.venue} · {e.time}</div>
            </div>
            <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
          </div>
        ))}
        {registered.size === 0 && <p style={{ color: "var(--text-muted)", padding: 20 }}>No registered events yet. Browse and RSVP!</p>}
      </div>

      {/* All Events Feed */}
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>🔥 All Campus Events</h3>
      <div className="activity-list">
        {EVENTS.slice(0, 8).map(e => (
          <div key={e.id} className="activity-item" onClick={() => setSelectedEvent(e)}>
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{fmtDate(e.date)} · {e.department}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {registered.has(e.id) && <span className="status-badge status-approved">Registered</span>}
              <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal" onClick={ev => ev.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.2rem" }}>{selectedEvent.title}</h2>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            </div>
            <div className="modal-body">
              <span className={`event-card-type type-${selectedEvent.type}`} style={{ position: "static", marginBottom: 16, display: "inline-block" }}>{selectedEvent.type}</span>
              <p style={{ color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.7 }}>{selectedEvent.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[["📅 Date", fmtDate(selectedEvent.date)], ["🕐 Time", selectedEvent.time], ["📍 Venue", selectedEvent.venue], ["🎤 Speaker", selectedEvent.speaker]].map(([l,v]) => (
                  <div key={l} style={{ padding: 12, background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 4, fontFamily: "Inter,sans-serif" }}>{l}</div>
                    <div style={{ fontSize: "0.85rem", fontFamily: "Inter,sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {registered.has(selectedEvent.id) ? (
                  <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} disabled>✅ Already Registered</button>
                ) : (
                  <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => handleRegister(selectedEvent.id)}>Register Now</button>
                )}
                <button className="btn btn-secondary btn-lg" onClick={() => toggleBookmark(selectedEvent.id)}>
                  {bookmarks.has(selectedEvent.id) ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
