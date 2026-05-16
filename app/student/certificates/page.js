"use client";

const CERTS = [
  { id: 1, event: "Workshop on Deep Learning for NLP", date: "18 Jun 2025", issuer: "Dept. of Computer Science", status: "issued", certId: "CB-2025-0042" },
  { id: 2, event: "Training: Research Methodology & Scientific Writing", date: "29 Jun 2025", issuer: "Central Library", status: "issued", certId: "CB-2025-0089" },
  { id: 3, event: "Hackathon: Smart Campus Solutions", date: "13 Jul 2025", issuer: "Coding Club, IIT-BHU", status: "pending", certId: "CB-2025-0134" },
];

export default function StudentCertificates() {
  return (
    <>
      <div className="dashboard-header">
        <h1>Certificates 📜</h1>
        <p>Attendance confirmations and participation certificates</p>
      </div>
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#10b981" }}>2</div>
          <div className="stat-label">Certificates Issued</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#f59e0b" }}>1</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Event</th><th>Date</th><th>Issuer</th><th>Certificate ID</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {CERTS.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.event}</td>
                <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{c.date}</td>
                <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{c.issuer}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--accent-primary)" }}>{c.certId}</td>
                <td><span className={`status-badge ${c.status === "issued" ? "status-approved" : "status-pending"}`}>{c.status}</span></td>
                <td>
                  {c.status === "issued" ? (
                    <button className="btn btn-primary btn-sm">📥 Download</button>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>Processing...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
