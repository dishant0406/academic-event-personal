"use client";
import { useState } from "react";
import { EVENT_TYPES, DEPARTMENTS } from "@/lib/data";

export default function FacultySubmit() {
  const [form, setForm] = useState({
    title: "", description: "", type: "seminar", department: DEPARTMENTS[1],
    date: "", endDate: "", time: "", venue: "", speaker: "", capacity: "", tags: ""
  });
  const [toast, setToast] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleSubmit = () => {
    if (!form.title.trim()) { showToast("⚠️ Please enter an event title"); return; }
    if (!form.description.trim()) { showToast("⚠️ Please enter a description"); return; }
    if (!form.date) { showToast("⚠️ Please select a start date"); return; }
    if (!form.venue.trim()) { showToast("⚠️ Please enter a venue"); return; }

    setSubmitted(true);
    showToast("✅ Event submitted for admin review! You'll be notified once approved.");
  };

  const handleReset = () => {
    setForm({ title: "", description: "", type: "seminar", department: DEPARTMENTS[1], date: "", endDate: "", time: "", venue: "", speaker: "", capacity: "", tags: "" });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <>
        <div className="dashboard-header">
          <h1>Create Event ➕</h1>
          <p>Publish a new academic event to the university</p>
        </div>
        <div style={{ textAlign: "center", padding: 60, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)" }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
          <h2 style={{ marginBottom: 12 }}>Event Submitted Successfully!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 8, fontFamily: "Inter,sans-serif" }}>
            Your event <strong>&quot;{form.title}&quot;</strong> has been submitted for review.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 32, fontFamily: "Inter,sans-serif" }}>
            The admin team will review it shortly. You&apos;ll receive a notification once it&apos;s approved.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" style={{ background: "#10b981" }} onClick={handleReset}>
              ➕ Submit Another Event
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => window.location.href = "/faculty"}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  return (
    <>
      <div className="dashboard-header">
        <h1>Create Event ➕</h1>
        <p>Publish a new academic event to the university</p>
      </div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <div className="form-group">
          <label className="form-label">Event Title *</label>
          <input className="form-input" placeholder="e.g. Workshop on Machine Learning" value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea className="form-textarea" placeholder="Describe the event, topics covered, who should attend…" value={form.description} onChange={e => set("description", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {EVENT_TYPES.filter(t => t.value !== "all").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)}>
              {DEPARTMENTS.filter(d => d !== "All Departments").map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Time</label>
            <input className="form-input" placeholder="e.g. 10:00 AM - 04:00 PM" value={form.time} onChange={e => set("time", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <input className="form-input" placeholder="e.g. Science Faculty Hall" value={form.venue} onChange={e => set("venue", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Speaker(s)</label>
          <input className="form-input" placeholder="e.g. Prof. Arun Kumar" value={form.speaker} onChange={e => set("speaker", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Capacity</label>
          <input className="form-input" type="number" placeholder="e.g. 200" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tags (comma-separated)</label>
          <input className="form-input" placeholder="e.g. AI, machine learning, workshop" value={form.tags} onChange={e => set("tags", e.target.value)} />
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", background: "#10b981" }} onClick={handleSubmit}>
          Submit for Review →
        </button>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12, fontFamily: "Inter,sans-serif" }}>
          Events are reviewed by administrators before being published.
        </p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
