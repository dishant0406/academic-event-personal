"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    department: "",
    rollNumber: "",
    year: "",
    email: ""
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setForm({
            fullName: data.user.fullName || "",
            department: data.user.department || "",
            rollNumber: data.user.rollNumber || "",
            year: data.user.year || "",
            email: data.user.email || ""
          });
        } else { router.push("/login"); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchUser();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fullName: form.fullName,
          department: form.department,
          rollNumber: form.rollNumber,
          year: form.year
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ Profile updated successfully!");
        setUser(data.user);
        const current = JSON.parse(localStorage.getItem("currentUser") || "{}");
        localStorage.setItem("currentUser", JSON.stringify({ ...current, ...data.user }));
      } else {
        showToast(`❌ ${data.message}`);
      }
    } catch (err) {
      showToast("❌ Failed to update profile.");
    } finally { setSaving(false); }
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ST";

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading profile...</div>;
  if (!user) return null;

  return (
    <>
      <div className="dashboard-header">
        <h1>My Profile 👤</h1>
        <p>Manage your student account</p>
      </div>
      <div className="form-container" style={{ maxWidth: "100%", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white", fontWeight: "bold" }}>
            {getInitials(user.fullName)}
          </div>
          <div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2rem", fontWeight: 700 }}>{user.fullName}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "Outfit, sans-serif" }}>{user.department} · {user.year}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "Outfit, sans-serif", marginTop: 4 }}>{user.email}</p>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input className="form-input" value={form.rollNumber} onChange={(e) => setForm({...form, rollNumber: e.target.value})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-input" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-input" value={form.year} onChange={(e) => setForm({...form, year: e.target.value})} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email <span style={{fontSize: "0.75rem", color: "var(--text-muted)"}}>(Cannot be changed)</span></label>
          <input className="form-input" value={form.email} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
        </div>
        <button 
          className="btn btn-primary btn-lg" 
          style={{ width: "100%", justifyContent: "center", border: "none" }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {toast && (
          <div style={{ position: "fixed", bottom: 20, right: 20, background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 24px", borderRadius: 8, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 1000 }}>
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
