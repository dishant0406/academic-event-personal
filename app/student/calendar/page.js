"use client";
import { useState } from "react";
import { EVENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudentCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const eventsByDate = {};
  EVENTS.forEach(e => { if (!eventsByDate[e.date]) eventsByDate[e.date] = []; eventsByDate[e.date].push(e); });

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(<div key={`e-${i}`} className="calendar-cell other-month" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const dayEvents = eventsByDate[dateStr] || [];
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    cells.push(
      <div key={d} className={`calendar-cell ${isToday ? "today" : ""}`}>
        <div className="calendar-day">{d}</div>
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 2 }}>
          {dayEvents.map(ev => <span key={ev.id} className="calendar-dot" style={{ background: ev.color }} title={ev.title} />)}
        </div>
        {dayEvents.length > 0 && <div style={{ fontSize: "0.6rem", marginTop: 4, color: "var(--accent-primary)", fontFamily: "Inter,sans-serif" }}>{dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}</div>}
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-header">
        <h1>Calendar 📅</h1>
        <p>View all events across the academic calendar</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
        <button className="btn btn-ghost" onClick={() => setMonthOffset(o => o-1)}>← Prev</button>
        <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.2rem" }}>{monthName}</h3>
        <button className="btn btn-ghost" onClick={() => setMonthOffset(o => o+1)}>Next →</button>
      </div>
      <div className="calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="calendar-header-cell">{d}</div>)}
        {cells}
      </div>
      <div style={{ marginTop: 32 }}>
        <h3 style={{ marginBottom: 16, fontFamily: "Inter,sans-serif", fontSize: "1rem", color: "var(--text-secondary)" }}>Events this month</h3>
        {EVENTS.filter(e => { const ed = new Date(e.date); return ed.getMonth() === month && ed.getFullYear() === year; }).map(e => (
          <div key={e.id} className="activity-item" style={{ marginBottom: 8 }}>
            <div style={{ width: 4, height: 40, borderRadius: 4, background: e.color, flexShrink: 0 }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{fmtDate(e.date)} · {e.venue}</div>
            </div>
            <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
          </div>
        ))}
      </div>
    </>
  );
}
