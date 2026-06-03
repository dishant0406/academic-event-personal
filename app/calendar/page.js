"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // Add state for modal
  const [expandedDay, setExpandedDay] = useState(null); // Add state for dropdown list
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("all");

  // Calendar state: defaults to current month
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setViewMode("foryou"); // Default to personalized view if logged in
    }
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = () => setExpandedDay(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE_URL = process.env.NODE_ENV === 'production' 
          ? "https://academic-event-7bk1.vercel.app/api" 
          : (process.env.NEXT_PUBLIC_API_URL || "https://academic-event-7bk1.vercel.app/api");
          
        const res = await fetch(`${API_BASE_URL}/events`);
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
    let filteredEvents = events;
    
    if (viewMode === "foryou" && user) {
      const userInterests = [...(user.interests || []), ...(user.subscribedSubjects || [])].map(i => i.toLowerCase());
      filteredEvents = events.filter(e => {
        // Faculty: show their own events or events in their department
        if (user.role === 'faculty') {
          if (e.createdBy && (e.createdBy._id === user.id || e.createdBy === user.id)) return true;
          if (e.department === user.department) return true;
        }
        // General: match tags with user interests
        if (userInterests.length > 0 && e.tags && e.tags.length > 0) {
          if (e.tags.some(tag => userInterests.includes(tag.toLowerCase()))) return true;
        }
        return false;
      });
    }

    return filteredEvents.filter(event => {
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

  const renderEventContent = (dayEvents, isFaded, cellId) => {
    if (dayEvents.length === 0) return null;

    if (expandedDay === cellId) {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", zIndex: 10 }}>
          {dayEvents.map((evt, idx) => {
            const eventId = evt._id || evt.id || idx;
            return (
              <div 
                key={eventId} 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(evt);
                }}
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
                  fontWeight: 600,
                  transition: "opacity 0.2s",
                  filter: isFaded ? "grayscale(40%)" : "none"
                }}
                onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
                onMouseOut={e => e.currentTarget.style.opacity = "1"}
                title={evt.title || 'Untitled Event'}
              >
                {evt.title || 'Untitled Event'}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setExpandedDay(cellId);
        }}
        style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "3px", cursor: "pointer" }}
        title={`${dayEvents.length} event(s) - Click to view`}
      >
        {dayEvents.slice(0, 3).map((evt, idx) => (
          <div key={idx} style={{ height: "4px", width: "100%", borderRadius: "4px", background: evt.color || "var(--accent-primary)", opacity: isFaded ? 0.4 : 1 }} />
        ))}
        {dayEvents.length > 3 && (
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "center", marginTop: "2px" }}>
            +{dayEvents.length - 3} more
          </div>
        )}
      </div>
    );
  };

  // Previous month days
  for (let i = 0; i < firstDayOfMonth; i++) {
    const dayNum = prevMonthLastDay - firstDayOfMonth + i + 1;
    const dayEvents = getEventsForDate(prevMonthYear, prevMonthNum, dayNum);
    const cellId = `prev-${dayNum}`;
    calendarDays.push(
      <div key={cellId} onClick={() => setExpandedDay(null)} style={{ 
        minHeight: "120px", 
        background: "rgba(15, 61, 50, 0.02)", 
        padding: "8px", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid var(--border)", 
        borderBottom: "1px solid var(--border)" 
      }}>
        <span style={{ textAlign: "right", fontWeight: 500, color: "var(--text-muted)", opacity: 0.5, fontSize: "0.9rem", marginBottom: "4px" }}>{dayNum}</span>
        {renderEventContent(dayEvents, true, cellId)}
      </div>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    const cellId = `day-${day}`;
    calendarDays.push(
      <div key={cellId} onClick={() => setExpandedDay(null)} style={{ 
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
        {renderEventContent(dayEvents, false, cellId)}
      </div>
    );
  }

  // Next month days
  const totalCells = calendarDays.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    const dayEvents = getEventsForDate(nextMonthYear, nextMonthNum, i);
    const cellId = `next-${i}`;
    calendarDays.push(
      <div key={cellId} onClick={() => setExpandedDay(null)} style={{ 
        minHeight: "120px", 
        background: "rgba(15, 61, 50, 0.02)", 
        padding: "8px", 
        display: "flex", 
        flexDirection: "column",
        borderRight: "1px solid var(--border)", 
        borderBottom: "1px solid var(--border)" 
      }}>
        <span style={{ textAlign: "right", fontWeight: 500, color: "var(--text-muted)", opacity: 0.5, fontSize: "0.9rem", marginBottom: "4px" }}>{i}</span>
        {renderEventContent(dayEvents, true, cellId)}
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
            <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Event Calendar 📅</h1>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
              {user && (
                <div style={{ display: "flex", background: "var(--bg-card)", padding: "4px", borderRadius: "100px", border: "1px solid var(--border)" }}>
                  <button onClick={() => setViewMode("foryou")} style={{ padding: "8px 16px", borderRadius: "100px", border: "none", cursor: "pointer", fontWeight: 600, background: viewMode === "foryou" ? "var(--accent-primary)" : "transparent", color: viewMode === "foryou" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>For You</button>
                  <button onClick={() => setViewMode("all")} style={{ padding: "8px 16px", borderRadius: "100px", border: "none", cursor: "pointer", fontWeight: 600, background: viewMode === "all" ? "var(--accent-primary)" : "transparent", color: viewMode === "all" ? "white" : "var(--text-secondary)", transition: "all 0.2s" }}>All Events</button>
                </div>
              )}
              
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

      {selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            background: 'var(--bg-primary)', padding: '30px', borderRadius: '12px',
            maxWidth: '500px', width: '90%', border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{selectedEvent.title}</h2>
              <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📅</span> <span>{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⏰</span> <span>{selectedEvent.time || 'TBA'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span> <span>{selectedEvent.venue || 'TBA'}</span>
              </div>
              {selectedEvent.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🏢</span> <span>{selectedEvent.department}</span>
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedEvent.description || 'No description available.'}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-ghost" onClick={() => setSelectedEvent(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => router.push(`/events/${selectedEvent._id || selectedEvent.id}`)}>RSVP & Details</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
