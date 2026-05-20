"use client";
import { useState, useEffect } from "react";

const PENDING = [
  { id: 101, title: "Workshop on Blockchain for Supply Chain", dept: "Dept. of Computer Science", submittedBy: "Dr. Vikash Gupta", date: "25 Jul 2025", type: "workshop" },
  { id: 102, title: "National Seminar on Sanskrit Pedagogy", dept: "Dept. of Sanskrit", submittedBy: "Prof. Shrinivasa", date: "28 Jul 2025", type: "seminar" },
  { id: 103, title: "Guest Lecture: Space Exploration in India", dept: "Dept. of Physics", submittedBy: "Dr. Meena Sinha", date: "01 Aug 2025", type: "lecture" },
];

export default function AdminApprovals() {
  const [pending, setPending] = useState(PENDING);
  const [toast, setToast] = useState(null);
  
  useEffect(() => {
    const localPending = JSON.parse(localStorage.getItem("pendingEvents") || "[]");
    if (localPending.length > 0) {
      const formatted = localPending.map(e => ({
        ...e,
        date: new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      }));
      setPending([...formatted, ...PENDING]);
    }
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const removePending = (id) => {
    setPending(p => p.filter(x => x.id !== id));
    const localPending = JSON.parse(localStorage.getItem("pendingEvents") || "[]");
    const updatedLocal = localPending.filter(e => e.id !== id);
    localStorage.setItem("pendingEvents", JSON.stringify(updatedLocal));
  };

  return (
    <>
      <div className="dashboard-header"><h1>Approvals ✅</h1><p>Review and moderate submitted events</p></div>
      {pending.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}><div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div><p>All caught up! No pending approvals.</p></div>
      ) : (
        <div className="activity-list">
          {pending.map(e => (
            <div key={e.id} className="activity-item" style={{ flexWrap: "wrap" }}>
              <div className="activity-dot" style={{ background: "#f59e0b" }} />
              <div className="activity-content" style={{ flex: 1 }}>
                <div className="activity-title">{e.title}</div>
                <div className="activity-meta">by {e.submittedBy} · {e.dept} · {e.date}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className={`event-card-type type-${e.type}`} style={{ position: "static" }}>{e.type}</span>
                <button className="btn btn-primary btn-sm" style={{ background: "#10b981" }} onClick={() => { removePending(e.id); showToast("✅ Approved!"); }}>Approve</button>
                <button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }} onClick={() => { removePending(e.id); showToast("❌ Rejected"); }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
