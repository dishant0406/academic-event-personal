"use client";
import { EVENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const MY_REGS = EVENTS.filter(e => [1, 2, 5, 9].includes(e.id));

export default function StudentRegistrations() {
  return (
    <>
      <div className="dashboard-header">
        <h1>My Registrations 🎫</h1>
        <p>Events you&apos;ve registered for</p>
      </div>
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#6366f1" }}>{MY_REGS.length}</div>
          <div className="stat-label">Total Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#10b981" }}>2</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#8b5cf6" }}>2</div>
          <div className="stat-label">Attended</div>
        </div>
      </div>
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>Upcoming Events</h3>
      <div className="activity-list" style={{ marginBottom: 32 }}>
        {MY_REGS.slice(0, 2).map(e => (
          <div key={e.id} className="activity-item">
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{fmtDate(e.date)} · {e.venue} · {e.time}</div>
            </div>
            <span className="status-badge status-approved">Confirmed</span>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>Past Events</h3>
      <div className="activity-list">
        {MY_REGS.slice(2).map(e => (
          <div key={e.id} className="activity-item" style={{ opacity: 0.7 }}>
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{fmtDate(e.date)} · {e.venue}</div>
            </div>
            <span className="status-badge" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}>Attended</span>
          </div>
        ))}
      </div>
    </>
  );
}
