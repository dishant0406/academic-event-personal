"use client";
export default function ScholarProfile() {
  return (
    <>
      <div className="dashboard-header"><h1>My Profile 👤</h1><p>Manage your research scholar account</p></div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white" }}>AV</div>
          <div>
            <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.2rem" }}>Ankit Verma</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Inter,sans-serif" }}>Ph.D. Research Scholar · Dept. of Physics</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "Inter,sans-serif" }}>ankit.verma@iitbhu.ac.in</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue="Ankit Verma" /></div>
          <div className="form-group"><label className="form-label">Scholar ID</label><input className="form-input" defaultValue="PHD-PHY-2023-011" /></div>
        </div>
        <div className="form-group"><label className="form-label">Research Domain</label><input className="form-input" defaultValue="Quantum Information Theory, Condensed Matter Physics" /></div>
        <div className="form-group"><label className="form-label">Supervisor</label><input className="form-input" defaultValue="Prof. Arun Kumar" /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="ankit.verma@iitbhu.ac.in" /></div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", background: "#8b5cf6" }}>Save Changes</button>
      </div>
    </>
  );
}
