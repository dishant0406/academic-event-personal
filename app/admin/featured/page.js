"use client";
import { useState } from "react";
import { EVENTS } from "@/lib/data";
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

export default function AdminFeatured() {
  const [featured, setFeatured] = useState(new Set(EVENTS.filter(e => e.featured).map(e => e.id)));
  const [toast, setToast] = useState(null);
  const toggle = (id) => { setFeatured(p => { const n = new Set(p); n.has(id)?n.delete(id):n.add(id); return n; }); setToast("⭐ Updated!"); setTimeout(() => setToast(null), 2000); };
  return (
    <>
      <div className="dashboard-header"><h1>Featured Events ⭐</h1><p>Select events to feature on the homepage</p></div>
      <div className="activity-list">
        {EVENTS.map(e => (
          <div key={e.id} className="activity-item">
            <div className="activity-dot" style={{ background: e.color }} />
            <div className="activity-content"><div className="activity-title">{e.title}</div><div className="activity-meta">{e.department} · {fmtDate(e.date)}</div></div>
            <button className={`btn ${featured.has(e.id)?"btn-primary":"btn-secondary"} btn-sm`} style={featured.has(e.id)?{background:"#f59e0b",color:"#1a1a1a"}:{}} onClick={()=>toggle(e.id)}>{featured.has(e.id)?"⭐ Featured":"☆ Feature"}</button>
          </div>
        ))}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
