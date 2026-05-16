"use client";
import { EVENTS } from "@/lib/data";

const MY = EVENTS.filter(e => [1, 2, 4, 9].includes(e.id)).map(e => ({
  ...e, views: Math.floor(Math.random() * 800) + 200, clicks: Math.floor(Math.random() * 200) + 50,
}));

export default function FacultyAnalytics() {
  const totalRegs = MY.reduce((s, e) => s + e.registrations, 0);
  const totalViews = MY.reduce((s, e) => s + e.views, 0);

  return (
    <>
      <div className="dashboard-header">
        <h1>Analytics 📈</h1>
        <p>Track performance of your events</p>
      </div>
      <div className="stats-grid">
        {[
          { value: MY.length, label: "Events Created", color: "#10b981" },
          { value: totalRegs, label: "Total Registrations", color: "#6366f1" },
          { value: totalViews.toLocaleString(), label: "Total Views", color: "#f59e0b" },
          { value: `${Math.round((totalRegs / MY.reduce((s,e) => s+e.capacity, 0)) * 100)}%`, label: "Avg Fill Rate", color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>Event Breakdown</h3>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
        {MY.map(e => (
          <div key={e.id} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Inter,sans-serif" }}>{e.title.slice(0, 50)}{e.title.length > 50 ? "…" : ""}</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>{e.registrations}/{e.capacity} registered</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(e.registrations / e.capacity) * 100}%`, background: e.color }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>👁️ {e.views} views</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>🖱️ {e.clicks} clicks</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>📊 {((e.clicks / e.views) * 100).toFixed(1)}% CTR</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
