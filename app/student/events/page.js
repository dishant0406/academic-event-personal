"use client";
import { EVENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const MY = EVENTS.filter(e => [1, 2, 4, 9].includes(e.id));

export default function FacultyEvents() {
  return (
    <>
      <div className="dashboard-header">
        <h1>My Events 📋</h1>
        <p>All events you&apos;ve created</p>
      </div>
      <div className="events-grid">
        {MY.map(e => (
          <div key={e.id} className="event-card">
            <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 100 }}>
              <span className={`event-card-type type-${e.type}`}>{e.type}</span>
            </div>
            <div className="event-card-body">
              <div className="event-card-date">📅 {fmtDate(e.date)}</div>
              <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>🎫 {e.registrations}/{e.capacity}</span>
                <span className="status-badge status-approved">Live</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent-rose)" }}>Cancel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
