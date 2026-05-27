"use client";

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/events?status=pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
         if (response.status === 401 || response.status === 403) {
             localStorage.removeItem('token');
             localStorage.removeItem('currentUser');
             window.location.href = '/login';
             return;
         }
         throw new Error('Failed to fetch pending events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${status} event`);
      }

      // Remove the processed event from the pending list
      setEvents(events.filter(event => (event._id || event.id) !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>Loading pending events...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        Admin Moderation Dashboard
      </h1>
      
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '3rem', fontSize: '1.1rem' }}>
          No pending events to review.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {events.map(event => {
            const eventId = event._id || event.id;
            return (
              <div key={eventId} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#fff'
              }}>
                <div style={{ flex: 1, paddingRight: '2rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#333' }}>{event.title}</h3>
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Location:</strong> {event.location || 'N/A'}</p>
                  </div>
                  <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>{event.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', minWidth: '120px' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(eventId, 'approved')}
                    style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: '#fff' }}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn"
                    onClick={() => handleStatusChange(eventId, 'rejected')}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: '#fff' }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
