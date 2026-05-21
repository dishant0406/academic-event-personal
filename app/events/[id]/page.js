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
        setEvent(data);
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
      alert('Successfully RSVP\\'d for the event!');
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
    
    // Format date for ICS (YYYYMMDDTHHmmssZ)
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(event.date);
    // Assuming a 2-hour duration if no end time is provided
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
      `LOCATION:${event.location || 'TBA'}`,
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'var(--font-outfit), sans-serif', color: 'var(--foreground, #fff)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '500' }}>Loading event details...</h2>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontFamily: 'var(--font-outfit), sans-serif' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>{error || 'Event not found'}</h2>
        <button className="btn-secondary" onClick={() => router.push('/events')}>
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '0 1rem',
      fontFamily: 'var(--font-outfit), sans-serif',
      color: 'var(--foreground, #fff)'
    }}>
      <button 
        className="btn-secondary" 
        onClick={() => router.push('/events')}
        style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
      >
        ← Back to Events
      </button>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '24px', 
        padding: '3rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'var(--primary-color, #4f46e5)', 
          color: 'white', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '999px', 
          fontSize: '0.875rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {event.category || 'Event'}
        </div>

        <h1 style={{ 
          fontFamily: 'var(--font-space-grotesk), sans-serif',
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          lineHeight: '1.1',
          background: 'linear-gradient(to right, #fff, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {event.title}
        </h1>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1.5rem', 
          marginBottom: '3rem', 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📅</span>
            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {event.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>⏰</span>
              {event.time}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            {event.location}
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            fontFamily: 'var(--font-space-grotesk), sans-serif',
            fontSize: '1.75rem',
            marginBottom: '1rem',
            color: '#fff'
          }}>
            About This Event
          </h2>
          <p style={{ 
            lineHeight: '1.8', 
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            whiteSpace: 'pre-wrap'
          }}>
            {event.description}
          </p>
        </div>

        {event.speakers && event.speakers.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              fontFamily: 'var(--font-space-grotesk), sans-serif',
              fontSize: '1.75rem',
              marginBottom: '1rem',
              color: '#fff'
            }}>
              Speakers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {event.speakers.map((speaker, index) => (
                <div key={index} style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  padding: '1rem', 
                  borderRadius: '12px',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🎙️</span> 
                  <span style={{ fontWeight: '500' }}>{speaker}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem', 
          marginTop: '2rem',
          paddingTop: '3rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button 
            className="btn-primary" 
            onClick={handleRSVP}
            disabled={rsvpStatus === 'loading'}
            style={{ 
              flex: '1 1 200px', 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              opacity: rsvpStatus === 'loading' ? 0.7 : 1
            }}
          >
            {rsvpStatus === 'loading' ? 'Processing...' : 'RSVP Now'}
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={handleBookmark}
            disabled={bookmarkStatus === 'loading'}
            style={{ 
              flex: '1 1 150px', 
              padding: '1rem 2rem', 
              fontSize: '1.1rem',
              opacity: bookmarkStatus === 'loading' ? 0.7 : 1
            }}
          >
            {bookmarkStatus === 'loading' ? 'Saving...' : 'Bookmark'}
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={generateICS}
            style={{ 
              flex: '1 1 150px', 
              padding: '1rem 2rem', 
              fontSize: '1.1rem'
            }}
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
