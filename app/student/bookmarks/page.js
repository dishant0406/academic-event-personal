"use client";
import { useState } from "react";
import { EVENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudentBookmarks() {
  const [bookmarks] = useState([1, 4, 5, 9, 10]);
  const saved = EVENTS.filter(e => bookmarks.includes(e.id));

  return (
    <>
      <div className="dashboard-header">
        <h1>Bookmarked Events ⭐</h1>
        <p>Events you&apos;ve saved for later</p>
      </div>
      {saved.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>⭐</div>
          <p>No bookmarks yet. Browse events and save the ones you like!</p>
        </div>
      ) : (
        <div className="events-grid">
          {saved.map(e => (
            <div key={e.id} className="event-card">
              <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 120 }}>
                <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                <button className="event-card-bookmark active">★</button>
              </div>
              <div className="event-card-body">
                <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
                <div className="event-card-meta">
                  <span className="event-card-dept">🏫 {e.department}</span>
                  <button className="btn btn-primary btn-sm">Register</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
