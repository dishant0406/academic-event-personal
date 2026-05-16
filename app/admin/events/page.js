"use client";
import { EVENTS } from "@/lib/data";
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function AdminEvents() {
  return (
    <>
      <div className="dashboard-header"><h1>All Events 📋</h1><p>Manage all university events</p></div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Event</th><th>Type</th><th>Date</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {EVENTS.map(e => (
              <tr key={e.id}>
                <td><div style={{ fontWeight: 600 }}>{e.title.length > 40 ? e.title.slice(0,40)+"…" : e.title}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{e.department}</div></td>
                <td><span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span></td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{fmtDate(e.date)}</td>
                <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="progress-bar" style={{ width: 60 }}><div className="progress-fill" style={{ width: `${(e.registrations/e.capacity)*100}%`, background: e.color }} /></div><span style={{ fontSize: "0.8rem" }}>{e.registrations}/{e.capacity}</span></div></td>
                <td><span className="status-badge status-approved">Approved</span></td>
                <td><div style={{ display: "flex", gap: 4 }}><button className="btn btn-ghost btn-sm">Edit</button><button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }}>Remove</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
