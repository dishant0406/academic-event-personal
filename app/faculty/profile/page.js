"use client";
export default function FacultyProfile() {
  return (
    <>
      <div className="dashboard-header"><h1>My Profile 👤</h1><p>Manage your faculty account</p></div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white" }}>PS</div>
          <div>
            <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.2rem" }}>Dr. Priya Sharma</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Inter,sans-serif" }}>Associate Professor · Dept. of Computer Science</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "Inter,sans-serif" }}>priya.sharma@iitbhu.ac.in</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue="Dr. Priya Sharma" /></div>
          <div className="form-group"><label className="form-label">Designation</label><input className="form-input" defaultValue="Associate Professor" /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Department</label><input className="form-input" defaultValue="Computer Science & Engineering" /></div>
          <div className="form-group"><label className="form-label">Faculty ID</label><input className="form-input" defaultValue="FAC-CS-2018-042" /></div>
        </div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="priya.sharma@iitbhu.ac.in" /></div>
        <div className="form-group"><label className="form-label">Research Areas</label><input className="form-input" defaultValue="Deep Learning, Natural Language Processing, Computer Vision" /></div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", background: "#10b981" }}>Save Changes</button>
      </div>
    </>
  );
}
