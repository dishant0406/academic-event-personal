"use client";
import { EVENTS } from "@/lib/data";

export default function AdminAnalytics() {
  const totalRegs = EVENTS.reduce((s, e) => s + e.registrations, 0);
  return (
    <>
      <div className="dashboard-header"><h1>Analytics 📈</h1><p>University-wide event analytics</p></div>
      <div className="stats-grid">
        {[
          { value: EVENTS.length, label: "Total Events", color: "#f59e0b" },
          { value: totalRegs.toLocaleString(), label: "Total Registrations", color: "#10b981" },
          { value: `${Math.round(totalRegs / EVENTS.length)}`, label: "Avg per Event", color: "#6366f1" },
          { value: "94%", label: "Approval Rate", color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} className="stat-card"><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>Events by Type</h3>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 32 }}>
        {[
          { type: "Conference", count: EVENTS.filter(e=>e.type==="conference").length, color: "#f43f5e" },
          { type: "Workshop", count: EVENTS.filter(e=>e.type==="workshop").length, color: "#f59e0b" },
          { type: "Seminar", count: EVENTS.filter(e=>e.type==="seminar").length, color: "#6366f1" },
          { type: "Lecture", count: EVENTS.filter(e=>e.type==="lecture").length, color: "#10b981" },
          { type: "Training", count: EVENTS.filter(e=>e.type==="training").length, color: "#06b6d4" },
        ].map(t => (
          <div key={t.type} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: "0.85rem", width: 90, fontFamily: "Inter,sans-serif", color: "var(--text-secondary)" }}>{t.type}</span>
            <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${(t.count/EVENTS.length)*100}%`, background: t.color }} /></div>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, fontFamily: "Inter,sans-serif", width: 20 }}>{t.count}</span>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 16 }}>Top Events by Registration</h3>
      <div className="activity-list">
        {[...EVENTS].sort((a,b) => b.registrations - a.registrations).slice(0,5).map(e => (
          <div key={e.id} className="activity-item">
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content">
              <div className="activity-title">{e.title}</div>
              <div className="activity-meta">{e.department}</div>
            </div>
            <span style={{ fontWeight: 700, fontFamily: "Inter,sans-serif", color: "var(--accent-primary)" }}>{e.registrations}</span>
          </div>
        ))}
      </div>
    </>
  );
}
