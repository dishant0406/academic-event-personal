"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmitEventPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'seminar',
    date: '',
    time: '',
    venue: '',
    speaker: '',
    capacity: '',
    department: '',
    tags: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication error: No token found. Please log in.', 'error');
        setLoading(false);
        return;
      }

      // Format payload
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit event');
      }

      showToast('Event submitted successfully!', 'success');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'seminar',
        date: '',
        time: '',
        venue: '',
        speaker: '',
        capacity: '',
        department: '',
        tags: ''
      });
      setStep(1);
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#111827' }}>Submit New Academic Event</h1>
      
      {/* Stepper Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        {[1, 2, 3].map(num => (
          <div key={num} style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: step >= num ? '#2563eb' : '#e5e7eb',
            color: step >= num ? '#fff' : '#6b7280',
            fontWeight: 'bold', zIndex: 1
          }}>
            {num}
          </div>
        ))}
        {/* Progress Line */}
        <div style={{ position: 'absolute', top: '15px', left: '16px', right: '16px', height: '2px', backgroundColor: '#e5e7eb', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '15px', left: '16px', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', height: '2px', backgroundColor: '#2563eb', zIndex: 0, transition: 'width 0.3s ease' }} />
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#374151', margin: 0 }}>Step 1: Basic Details</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Event Title <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" id="title" name="title" className="form-input" required value={formData.title} onChange={handleChange} placeholder="Enter event title" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="description">Description <span style={{color: '#ef4444'}}>*</span></label>
              <textarea id="description" name="description" className="form-input" rows={4} required value={formData.description} onChange={handleChange} placeholder="Describe the event..."></textarea>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="type">Event Type <span style={{color: '#ef4444'}}>*</span></label>
              <select id="type" name="type" className="form-input" required value={formData.type} onChange={handleChange}>
                <option value="seminar">Seminar</option>
                <option value="workshop">Workshop</option>
                <option value="lecture">Guest Lecture</option>
                <option value="conference">Conference</option>
                <option value="training">Training / Symposium</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#374151', margin: 0 }}>Step 2: Schedule & Venue</h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="form-label" htmlFor="date">Date <span style={{color: '#ef4444'}}>*</span></label>
                <input type="date" id="date" name="date" className="form-input" required value={formData.date} onChange={handleChange} />
              </div>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="form-label" htmlFor="time">Time <span style={{color: '#ef4444'}}>*</span></label>
                <input type="time" id="time" name="time" className="form-input" required value={formData.time} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="venue">Venue <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" id="venue" name="venue" className="form-input" required value={formData.venue} onChange={handleChange} placeholder="Room number or location" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="speaker">Speaker(s)</label>
              <input type="text" id="speaker" name="speaker" className="form-input" value={formData.speaker} onChange={handleChange} placeholder="e.g. Dr. Jane Doe" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="capacity">Capacity</label>
              <input type="number" id="capacity" name="capacity" className="form-input" min="1" value={formData.capacity} onChange={handleChange} placeholder="Maximum attendees" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#374151', margin: 0 }}>Step 3: Subjects & Tags</h2>
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department <span style={{color: '#ef4444'}}>*</span></label>
              <input type="text" id="department" name="department" className="form-input" required value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Subject Tags</label>
              <input type="text" id="tags" name="tags" className="form-input" value={formData.tags} onChange={handleChange} placeholder="e.g. AI, Machine Learning (comma separated)" />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {step > 1 ? (
            <button type="button" onClick={handlePrev} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#fff', color: '#374151', fontWeight: '500' }}>
              Previous
            </button>
          ) : (
            <div></div> 
          )}

          {step < 3 ? (
            <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.5rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting...' : 'Submit Event'}
            </button>
          )}
        </div>
      </form>

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          color: '#fff',
          backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
