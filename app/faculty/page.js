"use client";
import { useState, useEffect } from "react";
import { EVENTS, EVENT_TYPES, DEPARTMENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const MY_EVENTS = EVENTS.filter(e => [1, 2, 4, 9].includes(e.id)).map(e => ({
  ...e,
  views: (e.id * 123) % 800 + 200,
  clickRate: ((e.id * 7) % 20 + 10).toFixed(1),
}));

export default function FacultyDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", type: "seminar", department: DEPARTMENTS[1], date: "", endDate: "", time: "", venue: "", speaker: "", tags: "" });

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const totalRegs = MY_EVENTS.reduce((s, e) => s + e.registrations, 0);
  const totalViews = MY_EVENTS.reduce((s, e) => s + e.views, 0);

  return (
    <>
      <div className="dashboard-header">
        <h1>Welcome back, {user ? user.fullName.split(" ")[0] : "Faculty"}! 👨‍🏫</h1>
        <p>Manage your events and track engagement</p>
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {["dashboard", "create", "my events"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <>
          <div className="stats-grid">
            {[
              { value: MY_EVENTS.length, label: "My Events", color: "#10b981", icon: "📋" },
              { value: totalRegs, label: "Total Registrations", color: "#6366f1", icon: "🎫" },
              { value: totalViews.toLocaleString(), label: "Total Views", color: "#f59e0b", icon: "👁️" },
              { value: "4.8", label: "Avg Rating", color: "#8b5cf6", icon: "⭐" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  <div style={{ fontSize: "2rem", opacity: 0.5 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>📋 My Events Performance</h3>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 32 }}>
            <table className="data-table">
              <thead><tr><th>Event</th><th>Date</th><th>Views</th><th>Registrations</th><th>Fill Rate</th><th>Status</th></tr></thead>
              <tbody>
                {MY_EVENTS.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{e.title.length > 45 ? e.title.slice(0, 45) + "…" : e.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.department}</div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{fmtDate(e.date)}</td>
                    <td style={{ fontFamily: "Inter,sans-serif" }}>{e.views}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${(e.registrations/e.capacity)*100}%`, background: e.color }} />
                        </div>
                        <span style={{ fontSize: "0.8rem" }}>{e.registrations}/{e.capacity}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{Math.round((e.registrations/e.capacity)*100)}%</td>
                    <td><span className="status-badge status-approved">Live</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>🔔 Upcoming Reminders</h3>
          <div className="activity-list">
            {MY_EVENTS.slice(0, 3).map(e => (
              <div key={e.id} className="activity-item">
                <div className="activity-dot" style={{ background: "#10b981" }} />
                <div className="activity-content">
                  <div className="activity-title">You&apos;re hosting: {e.title.slice(0, 50)}</div>
                  <div className="activity-meta">{fmtDate(e.date)} · {e.venue}</div>
                </div>
                <button className="btn btn-ghost btn-sm">Edit</button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "create" && (
        <div className="form-container" style={{ maxWidth: "100%" }}>
          <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.1rem", marginBottom: 24 }}>Create New Event</h3>
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input className="form-input" placeholder="e.g. Workshop on Machine Learning" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" placeholder="Describe the event..." value={form.description} onChange={e => set("description", e.target.value)} />
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
              <label className="form-label">Venue</label>
              <input className="form-input" placeholder="e.g. Science Faculty Hall" value={form.venue} onChange={e => set("venue", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Speaker(s)</label>
            <input className="form-input" placeholder="e.g. Prof. Arun Kumar" value={form.speaker} onChange={e => set("speaker", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-input" placeholder="e.g. AI, machine learning, workshop" value={form.tags} onChange={e => set("tags", e.target.value)} />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", background: "#10b981" }}
            onClick={() => { 
              if (!form.title || !form.date) return showToast("⚠️ Fill required fields"); 
              
              // Save to localStorage so Admin page can see it
              const newEvent = {
                id: Date.now(),
                title: form.title,
                dept: form.department,
                submittedBy: "Dr. Priya Sharma", // Mock faculty name
                date: form.date,
                type: form.type
              };
              const existing = JSON.parse(localStorage.getItem("pendingEvents") || "[]");
              localStorage.setItem("pendingEvents", JSON.stringify([...existing, newEvent]));
              
              setForm({ title: "", description: "", type: "seminar", department: DEPARTMENTS[1], date: "", endDate: "", time: "", venue: "", speaker: "", tags: "" });
              showToast("✅ Event submitted for admin review!"); 
            }}>
            Submit for Review →
          </button>
        </div>
      )}

      {tab === "my events" && (
        <>
          <div className="events-grid">
            {MY_EVENTS.map(e => (
              <div key={e.id} className="event-card">
                <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)`, height: 100 }}>
                  <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                  <h3 className="event-card-title" style={{ fontSize: "1rem" }}>{e.title}</h3>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>👁️ {e.views} views</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>🎫 {e.registrations} registered</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "var(--accent-rose)" }}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
