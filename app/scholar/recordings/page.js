"use client";
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
const RECS = [
  { id: 1, title: "Advances in Quantum Error Correction — Prof. Arun Kumar", date: "2025-05-10", dept: "Dept. of Physics", duration: "1h 45m", views: 423 },
  { id: 2, title: "Introduction to Transformer Architectures — Dr. Priya Sharma", date: "2025-05-05", dept: "Dept. of Computer Science", duration: "2h 10m", views: 891 },
  { id: 3, title: "Paninian Grammar & NLP — Prof. Amba Kulkarni", date: "2025-04-28", dept: "Dept. of Sanskrit", duration: "1h 20m", views: 234 },
  { id: 4, title: "Climate Modeling with Machine Learning — Dr. Vikram Singh", date: "2025-04-15", dept: "Dept. of Agricultural Sciences", duration: "1h 55m", views: 312 },
];
export default function ScholarRecordings() {
  return (
    <>
      <div className="dashboard-header"><h1>Recordings 🎬</h1><p>Past event recordings and materials</p></div>
      <div className="activity-list">
        {RECS.map(r => (
          <div key={r.id} className="activity-item">
            <div style={{ fontSize: "1.5rem" }}>🎬</div>
            <div className="activity-content">
              <div className="activity-title">{r.title}</div>
              <div className="activity-meta">{fmtDate(r.date)} · {r.dept} · ⏱️ {r.duration} · 👁️ {r.views} views</div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ background: "#8b5cf6" }}>▶ Watch</button>
          </div>
        ))}
      </div>
    </>
  );
}
