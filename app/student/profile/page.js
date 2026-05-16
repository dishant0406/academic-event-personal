"use client";

export default function StudentProfile() {
  return (
    <>
      <div className="dashboard-header">
        <h1>My Profile 👤</h1>
        <p>Manage your account and preferences</p>
      </div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>RS</div>
          <div>
            <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.2rem" }}>Rahul Sharma</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Inter,sans-serif" }}>B.Tech Computer Science · 3rd Year</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "Inter,sans-serif" }}>rahul.sharma@iitbhu.ac.in</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" defaultValue="Rahul Sharma" />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input className="form-input" defaultValue="21CS1045" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-input" defaultValue="Computer Science & Engineering" />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" defaultValue="3rd Year" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" defaultValue="rahul.sharma@iitbhu.ac.in" />
        </div>
        <div className="form-group">
          <label className="form-label">Interests (comma-separated)</label>
          <input className="form-input" defaultValue="Machine Learning, Quantum Computing, NLP, Competitive Programming" />
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>Save Changes</button>
      </div>
    </>
  );
}
