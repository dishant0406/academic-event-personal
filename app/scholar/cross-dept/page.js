"use client";
import { EVENTS } from "@/lib/data";
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function ScholarCrossDept() {
  const cross = EVENTS.filter(e => e.faculty !== "Institute of Technology");
  return (
    <>
      <div className="dashboard-header"><h1>Cross-Department 🏛️</h1><p>Discover events outside your department</p></div>
      <div className="events-grid">
        {cross.map(e => (
          <div key={e.id} className="event-card">
            <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 100 }}>
              <span className={`event-card-type type-${e.type}`}>{e.type}</span>
            </div>
            <div className="event-card-body">
              <div className="event-card-date">📅 {fmtDate(e.date)}</div>
              <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
              <p className="event-card-desc">{e.description}</p>
              <div className="event-card-meta"><span className="event-card-dept">🏛️ {e.faculty}</span><button className="btn btn-ghost btn-sm">⭐ Save</button></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
