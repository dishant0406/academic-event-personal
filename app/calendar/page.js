"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calendar state: defaults to current month
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        if (!res.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await res.json();
        
        const eventsList = data.data || data.events || data;
        
        const approvedEvents = Array.isArray(eventsList) 
          ? eventsList.filter(e => {
              const status = (e.status || '').toLowerCase();
              return status === 'approved' || status === '';
            })
          : [];
          
        setEvents(approvedEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="spinner" style={{ width: 40, height: 40, border: "4px solid var(--border)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--danger, #ef4444)" }}>
        <h2>Error loading calendar</h2>
        <p>{error}</p>
      </div>
    );
  }

  const calendarDays = [];
  
  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  const prevMonthLastDay = prevMonthDate.getDate();
  const prevMonthNum = prevMonthDate.getMonth();
  const prevMonthYear = prevMonthDate.getFullYear();

  const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextMonthNum = nextMonthDate.getMonth();
  const nextMonthYear = nextMonthDate.getFullYear();

  const getEventsForDate = (year, month, day) => {
    return events.filter(event => {
      const eventDateStr = event.date || event.startTime || event.createdAt;
      if (!eventDateStr) return false;
      try {
        const d = new Date(eventDateStr);
        return d.getFullYear() === year &&
               d.getMonth() === month &&
               d.getDate() === day;
      } catch (e) {
        return false;
      }
    });
  };

  const renderEventList = (dayEvents, isFaded) => {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto", maxHeight: "100px", opacity: isFaded ? 0.6 : 1 }}>
        {dayEvents.map((evt, idx) => {
          const eventId = evt._id || evt.id || idx;
          return (
            <div 
              key={eventId} 
              onClick={() => router.push(`/events/${eventId}`)}
              style={{
                fontSize: "0.75rem",
                padding: "4px 6px",
                borderRadius: "4px",
                background: evt.color ? `${evt.color}22` : "var(--accent-secondary)",
                color: evt.color || "var(--accent-primary)",
                border: `1px solid ${evt.color ? `${evt.color}44` : "var(--border)"}`,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                fontWeight: 500,
                transition: "opacity 0.2s",
                filter: isFaded ? "grayscale(40%)" : "none"
              }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
              title={evt.title || 'Untitled Event'}
            >
              {evt.time && <span style={{ opacity: 0.7, marginRight: "4px" }}>{evt.time}</span>}
              {evt.title || 'Untitled Event'}
            </div>
          );
        })}
      </div>
    );
  };

  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    const dayNum = prevMonthLastDay - firstDayOfMonth + i + 1;
    const dayEvents = getEventsForDate(prevMonthYear, prevMonthNum, dayNum);
    calendarDays.push(
      <div key={`prev-${dayNum}`} style={{ 
        minHeight: "120px", 
        background: "rgba(15, 61, 50, 0.02)", 
        padding: "8px", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid var(--border)", 
        borderBottom: "1px solid var(--border)" 
      }}>
        <span style={{ textAlign: "right", fontWeight: 500, color: "var(--text-muted)", opacity: 0.5, fontSize: "0.9rem", marginBottom: "4px" }}>{dayNum}</span>
        {renderEventList(dayEvents, true)}
      </div>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push(
      <div key={`day-${day}`} style={{ 
        minHeight: "120px", 
        background: "var(--bg-card)", 
        padding: "8px", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.2s"
      }}>
        <span style={{ textAlign: "right", fontWeight: 600, color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "4px" }}>{day}</span>
        {renderEventList(dayEvents, false)}
      </div>
    );
  }

  // Next month days
  const totalCells = calendarDays.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    const dayEvents = getEventsForDate(nextMonthYear, nextMonthNum, i);
    calendarDays.push(
      <div key={`next-${i}`} style={{ 
        minHeight: "120px", 
        background: "rgba(15, 61, 50, 0.02)", 
        padding: "8px", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid var(--border)", 
        borderBottom: "1px solid var(--border)" 
      }}>
        <span style={{ textAlign: "right", fontWeight: 500, color: "var(--text-muted)", opacity: 0.5, fontSize: "0.9rem", marginBottom: "4px" }}>{i}</span>
        {renderEventList(dayEvents, true)}
      </div>
    );
  }

  return (
    <>
      {/* NAVBAR (Simple version for calendar page) */}
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          <div className="logo-icon">⚡</div>
          Academic Events Hub
        </div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/calendar" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Calendar</a>
        </div>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/dashboard")}>Dashboard</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "100px auto 40px", padding: "0 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "30px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <h1 style={{ fontSize: "2.5rem" }}>Event Calendar 📅</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "var(--bg-card)", padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <button 
                onClick={prevMonth}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-secondary)", padding: "4px 8px" }}
              >
                ←
              </button>
              <span style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)", minWidth: "160px", textAlign: "center", fontFamily: "Space Grotesk, sans-serif" }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button 
                onClick={nextMonth}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-secondary)", padding: "4px 8px" }}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "rgba(15, 61, 50, 0.03)", borderBottom: "1px solid var(--border)" }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: "16px 8px", textAlign: "center", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", borderRight: "1px solid var(--border)" }}>
                {day}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {calendarDays}
          </div>
        </div>
      </div>
    </>
  );
}
