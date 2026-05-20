"use client";
import { useState, useEffect } from "react";

export default function StudentProfile() {
  const [user, setUser] = useState({
    fullName: "Ashish Kumar Panigrahi",
    email: "ashish.panigrahi@iitbhu.ac.in",
    department: "Computer Science & Engineering",
    rollNumber: "21CS1045",
    year: "3rd Year"
  });

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.fullName) setUser(parsed);
      } catch (e) {}
    }
  }, []);

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "ST";
  };

  return (
    <>
      <div className="dashboard-header">
        <h1>My Profile 👤</h1>
        <p>Manage your account and preferences</p>
      </div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>{getInitials(user.fullName)}</div>
          <div>
            <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1.2rem" }}>{user.fullName}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "Inter,sans-serif" }}>{user.department} · {user.year}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "Inter,sans-serif" }}>{user.email}</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={user.fullName} onChange={(e) => setUser({...user, fullName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input className="form-input" value={user.rollNumber} onChange={(e) => setUser({...user, rollNumber: e.target.value})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-input" value={user.department} onChange={(e) => setUser({...user, department: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" value={user.year} onChange={(e) => setUser({...user, year: e.target.value})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">Interests (comma-separated)</label>
          <input className="form-input" defaultValue="Machine Learning, Quantum Computing, NLP, Competitive Programming" />
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => localStorage.setItem("currentUser", JSON.stringify(user))}>Save Changes</button>
      </div>
    </>
  );
}
