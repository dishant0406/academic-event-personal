"use client";
import { useState } from "react";
import { EVENTS, DEPARTMENTS } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const PENDING_EVENTS = [
  { id: 101, title: "Workshop on Blockchain for Supply Chain", dept: "Dept. of Computer Science", submittedBy: "Dr. Vikash Gupta", date: "2025-07-25", type: "workshop" },
  { id: 102, title: "National Seminar on Sanskrit Pedagogy", dept: "Dept. of Sanskrit", submittedBy: "Prof. Shrinivasa", date: "2025-07-28", type: "seminar" },
  { id: 103, title: "Guest Lecture: Space Exploration in India", dept: "Dept. of Physics", submittedBy: "Dr. Meena Sinha", date: "2025-08-01", type: "lecture" },
];

const USERS = [
  { id: 1, name: "Rahul Sharma", role: "Student", dept: "Computer Science", email: "rahul@bhu.ac.in", events: 5 },
  { id: 2, name: "Dr. Priya Sharma", role: "Faculty", dept: "Computer Science", email: "priya@bhu.ac.in", events: 3 },
  { id: 3, name: "Ankit Verma", role: "Scholar", dept: "Physics", email: "ankit@bhu.ac.in", events: 0 },
  { id: 4, name: "Prof. Rajesh Verma", role: "Faculty", dept: "Physics", email: "rajesh@bhu.ac.in", events: 4 },
  { id: 5, name: "Sneha Gupta", role: "Student", dept: "Mathematics", email: "sneha@bhu.ac.in", events: 2 },
  { id: 6, name: "Dr. Anand Mishra", role: "Faculty", dept: "Mathematics", email: "anand@bhu.ac.in", events: 1 },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [pending, setPending] = useState(PENDING_EVENTS);
  const [toast, setToast] = useState(null);
  const [featured, setFeatured] = useState(new Set(EVENTS.filter(e => e.featured).map(e => e.id)));

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const approveEvent = (id) => {
    setPending(prev => prev.filter(e => e.id !== id));
    showToast("✅ Event approved and published!");
  };
  const rejectEvent = (id) => {
    setPending(prev => prev.filter(e => e.id !== id));
    showToast("❌ Event rejected");
  };
  const toggleFeatured = (id) => {
    setFeatured(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    showToast("⭐ Featured status updated");
  };

  const totalRegs = EVENTS.reduce((s, e) => s + e.registrations, 0);

  return (
    <>
      <div className="dashboard-header">
        <h1>Admin Dashboard 🛡️</h1>
        <p>University-wide event management and analytics</p>
      </div>

      <div className="tabs" style={{ marginBottom: 28 }}>
        {["overview", "approvals", "all events", "users", "featured"].map(t => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={tab === t ? { background: "#f59e0b", color: "#1a1a1a" } : {}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "approvals" && pending.length > 0 && (
              <span style={{ marginLeft: 6, background: "var(--accent-rose)", color: "white", borderRadius: 50, padding: "1px 7px", fontSize: "0.7rem" }}>{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="stats-grid">
            {[
              { value: EVENTS.length, label: "Total Events", color: "#f59e0b", icon: "📋", change: "+12%" },
              { value: totalRegs.toLocaleString(), label: "Total Registrations", color: "#10b981", icon: "🎫", change: "+28%" },
              { value: pending.length, label: "Pending Approvals", color: "#f43f5e", icon: "⏳", change: "" },
              { value: USERS.length, label: "Active Users", color: "#6366f1", icon: "👥", change: "+15%" },
              { value: DEPARTMENTS.length - 1, label: "Departments", color: "#8b5cf6", icon: "🏛️", change: "" },
              { value: "94%", label: "Approval Rate", color: "#06b6d4", icon: "✅", change: "+3%" },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    {s.change && <div className="stat-change positive">{s.change} vs last month</div>}
                  </div>
                  <div style={{ fontSize: "2rem", opacity: 0.5 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>📊 Events by Type</h3>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                {[
                  { type: "Conference", count: EVENTS.filter(e=>e.type==="conference").length, color: "#f43f5e" },
                  { type: "Workshop", count: EVENTS.filter(e=>e.type==="workshop").length, color: "#f59e0b" },
                  { type: "Seminar", count: EVENTS.filter(e=>e.type==="seminar").length, color: "#6366f1" },
                  { type: "Lecture", count: EVENTS.filter(e=>e.type==="lecture").length, color: "#10b981" },
                  { type: "Training", count: EVENTS.filter(e=>e.type==="training").length, color: "#06b6d4" },
                ].map(t => (
                  <div key={t.type} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: "0.85rem", width: 80, fontFamily: "Inter,sans-serif", color: "var(--text-secondary)" }}>{t.type}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${(t.count / EVENTS.length) * 100}%`, background: t.color }} />
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "Inter,sans-serif", width: 20 }}>{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>🔔 Recent Activity</h3>
              <div className="activity-list">
                {[
                  { text: "Dr. Vikash Gupta submitted 'Blockchain Workshop'", time: "2 hours ago", color: "#f59e0b" },
                  { text: "Quantum Computing Conference got 50 new registrations", time: "5 hours ago", color: "#10b981" },
                  { text: "Prof. Shrinivasa submitted 'Sanskrit Pedagogy Seminar'", time: "1 day ago", color: "#6366f1" },
                  { text: "Smart Campus Hackathon featured on homepage", time: "2 days ago", color: "#8b5cf6" },
                ].map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" style={{ background: a.color }} />
                    <div className="activity-content">
                      <div className="activity-title">{a.text}</div>
                      <div className="activity-meta">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "approvals" && (
        <>
          <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>⏳ Pending Approvals ({pending.length})</h3>
          {pending.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
              <p>All caught up! No pending approvals.</p>
            </div>
          ) : (
            <div className="activity-list">
              {pending.map(e => (
                <div key={e.id} className="activity-item" style={{ flexWrap: "wrap" }}>
                  <div className="activity-dot" style={{ background: "#f59e0b" }} />
                  <div className="activity-content" style={{ flex: 1 }}>
                    <div className="activity-title">{e.title}</div>
                    <div className="activity-meta">Submitted by {e.submittedBy} · {e.dept} · {fmtDate(e.date)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
                    <button className="btn btn-primary btn-sm" style={{ background: "#10b981" }} onClick={() => approveEvent(e.id)}>✅ Approve</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }} onClick={() => rejectEvent(e.id)}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "all events" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {EVENTS.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{e.title.length > 40 ? e.title.slice(0, 40) + "…" : e.title}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.department}</div>
                  </td>
                  <td><span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span></td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{fmtDate(e.date)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${(e.registrations/e.capacity)*100}%`, background: e.color }} />
                      </div>
                      <span style={{ fontSize: "0.8rem" }}>{e.registrations}/{e.capacity}</span>
                    </div>
                  </td>
                  <td><span className="status-badge status-approved">Approved</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th><th>Events</th><th>Actions</th></tr></thead>
            <tbody>
              {USERS.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>
                    <span className="status-badge" style={{
                      background: u.role === "Student" ? "rgba(99,102,241,0.15)" : u.role === "Faculty" ? "rgba(16,185,129,0.15)" : "rgba(139,92,246,0.15)",
                      color: u.role === "Student" ? "#6366f1" : u.role === "Faculty" ? "#10b981" : "#8b5cf6"
                    }}>{u.role}</span>
                  </td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{u.dept}</td>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.email}</td>
                  <td style={{ fontFamily: "Inter,sans-serif" }}>{u.events}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "featured" && (
        <>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Select events to feature on the homepage. Featured events get maximum visibility.</p>
          <div className="activity-list">
            {EVENTS.map(e => (
              <div key={e.id} className="activity-item">
                <div className="activity-dot" style={{ background: e.color }} />
                <div className="activity-content">
                  <div className="activity-title">{e.title}</div>
                  <div className="activity-meta">{e.department} · {fmtDate(e.date)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
                  <button className={`btn ${featured.has(e.id) ? "btn-primary" : "btn-secondary"} btn-sm`}
                    style={featured.has(e.id) ? { background: "#f59e0b", color: "#1a1a1a" } : {}}
                    onClick={() => toggleFeatured(e.id)}>
                    {featured.has(e.id) ? "⭐ Featured" : "☆ Feature"}
                  </button>
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
