"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventDetailPage({ params }) {
  const [id, setId] = useState(null);
  const router = useRouter();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [bookmarkStatus, setBookmarkStatus] = useState('');

  // Unwrap params safely in case it is a Promise (Next.js 15+)
  useEffect(() => {
    Promise.resolve(params).then(p => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch event details');
        }
        const data = await res.json();
        setEvent(data.event || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRSVP = async () => {
    try {
      setRsvpStatus('loading');
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to RSVP');
        router.push('/login');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to RSVP');
      }

      setRsvpStatus('success');
      alert("Successfully RSVP\\'d for the event!");
    } catch (err) {
      setRsvpStatus('error');
      alert(err.message);
    }
  };

  const handleBookmark = async () => {
    try {
      setBookmarkStatus('loading');
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to bookmark');
        router.push('/login');
        return;
      }

      const res = await fetch(`http://localhost:5000/api/users/bookmarks/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to bookmark event');
      }

      setBookmarkStatus('success');
      alert('Event bookmarked successfully!');
    } catch (err) {
      setBookmarkStatus('error');
      alert(err.message);
    }
  };

  const generateICS = () => {
    if (!event) return;
    
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(event.date);
    const end = new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Academic Events Hub//EN',
      'BEGIN:VEVENT',
      `UID:${id}@academiceventshub.com`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || 'Academic Event'}`,
      `LOCATION:${event.venue || event.location || 'TBA'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\r\\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(event.title || 'event').replace(/\\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ width: 40, height: 40, border: "4px solid var(--border)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes spin { 100% { transform: rotate(360deg); } }`}} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--danger, #ef4444)' }}>
        <h2>{error || 'Event not found'}</h2>
        <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          <div className="logo-icon">⚡</div>
          Academic Events Hub
        </div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/calendar">Calendar</a>
        </div>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/dashboard")}>Dashboard</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '120px auto 60px', padding: '0 20px' }}>
        <button 
          className="btn btn-ghost" 
          onClick={() => router.push('/')}
          style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← Back to Events
        </button>

        <div className="form-container" style={{ maxWidth: "100%", margin: 0, padding: "40px" }}>
          <div style={{ 
            display: 'inline-block', 
            background: 'var(--accent-secondary)', 
            color: 'var(--accent-primary)', 
            padding: '6px 16px', 
            borderRadius: '100px', 
            fontSize: '0.85rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            border: '1px solid var(--border)'
          }}>
            {event.type || 'Event'}
          </div>

          <h1 style={{ 
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            lineHeight: '1.2',
            color: 'var(--text-primary)'
          }}>
            {event.title}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '24px', 
            marginBottom: '3rem', 
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--bg-primary)", padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: '1.3rem' }}>📅</span>
              <span style={{ fontWeight: 500 }}>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            {event.time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--bg-primary)", padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: '1.3rem' }}>⏰</span>
                <span style={{ fontWeight: 500 }}>{event.time}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--bg-primary)", padding: "10px 20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: '1.3rem' }}>📍</span>
              <span style={{ fontWeight: 500 }}>{event.venue || event.location || 'TBA'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              About This Event
            </h2>
            <p style={{ 
              lineHeight: '1.8', 
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              whiteSpace: 'pre-wrap'
            }}>
              {event.description}
            </p>
          </div>

          {event.speaker && (
            <div style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
                Speaker
              </h2>
              <div style={{ 
                background: 'var(--bg-primary)', 
                padding: '20px', 
                borderRadius: '16px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                border: '1px solid var(--border)',
                width: 'fit-content',
                minWidth: '300px'
              }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {event.speaker.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{event.speaker}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Featured Speaker</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '16px', 
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border)'
          }}>
            <button 
              className="btn btn-primary" 
              onClick={handleRSVP}
              disabled={rsvpStatus === 'loading'}
              style={{ padding: '16px 32px', fontSize: '1.1rem', opacity: rsvpStatus === 'loading' ? 0.7 : 1 }}
            >
              {rsvpStatus === 'loading' ? 'Processing...' : 'RSVP Now'}
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={handleBookmark}
              disabled={bookmarkStatus === 'loading'}
              style={{ padding: '16px 32px', fontSize: '1.1rem', opacity: bookmarkStatus === 'loading' ? 0.7 : 1 }}
            >
              {bookmarkStatus === 'loading' ? 'Saving...' : 'Bookmark Event'}
            </button>
            
            <button 
              className="btn btn-ghost" 
              onClick={generateICS}
              style={{ padding: '16px 32px', fontSize: '1.1rem' }}
            >
              Add to Calendar 📅
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
