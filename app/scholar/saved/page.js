"use client";
import { EVENTS } from "@/lib/data";
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function ScholarSaved() {
  const saved = EVENTS.filter(e => [4, 5, 10].includes(e.id));
  return (
    <>
      <div className="dashboard-header"><h1>Saved Events ⭐</h1><p>Events you&apos;ve bookmarked for later</p></div>
      <div className="events-grid">
        {saved.map(e => (
          <div key={e.id} className="event-card">
            <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 100 }}>
              <span className={`event-card-type type-${e.type}`}>{e.type}</span>
              <button className="event-card-bookmark active">★</button>
            </div>
            <div className="event-card-body">
              <div className="event-card-date">📅 {fmtDate(e.date)}</div>
              <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
              <div className="event-card-meta"><span className="event-card-dept">🎤 {e.speaker}</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
