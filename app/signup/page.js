"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DEPARTMENTS = [
  "Computer Science & Engineering", "Physics", "Mathematics", "Chemistry",
  "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
  "Agricultural Sciences", "Zoology", "Botany", "Sanskrit", "Hindi",
  "Philosophy", "Ayurveda", "Mining Engineering", "Metallurgy",
  "Pharmaceutical Sciences", "Biochemistry", "Women's Studies"
];

const ROLES = [
  { id: "student", icon: "🎓", label: "Student", color: "#6366f1", desc: "Undergraduate or postgraduate student" },
  { id: "faculty", icon: "👨‍🏫", label: "Faculty", color: "#10b981", desc: "Professor, lecturer, or teaching staff" },
  { id: "scholar", icon: "🔬", label: "Research Scholar", color: "#8b5cf6", desc: "Ph.D. or M.Phil. research scholar" },
  { id: "admin", icon: "🛡️", label: "Administrator", color: "#f59e0b", desc: "Department or university admin" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
    department: DEPARTMENTS[0], rollNumber: "", year: "B.Tech 1st Year",
    designation: "", facultyId: "", researchDomain: "", supervisor: "",
    adminCode: "", phone: ""
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const selectedRole = ROLES.find(r => r.id === role);

  const handleSelectRole = (id) => {
    setRole(id);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { showToast("⚠️ Please enter your full name"); return; }
    if (!form.email.trim()) { showToast("⚠️ Please enter your email"); return; }
    if (!form.password || form.password.length < 6) { showToast("⚠️ Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { showToast("⚠️ Passwords do not match"); return; }
    if (role === "admin" && !form.adminCode.trim()) { showToast("⚠️ Please enter your admin authorization code"); return; }
    if (role === "faculty" && !form.designation) { showToast("⚠️ Please select your designation"); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        setSuccess(true);
      } else {
        showToast(`❌ ${data.message || "Failed to create account"}`);
      }
    } catch (err) {
      showToast("❌ Server error. Please verify the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>
        <div className="auth-container fade-in" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
          <h1 style={{ marginBottom: 12 }}>Account Created!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 8, fontFamily: "Inter,sans-serif" }}>
            Welcome to AEH, <strong>{form.fullName}</strong>!
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 32, fontFamily: "Inter,sans-serif" }}>
            {role === "admin"
              ? "Your admin account has been created and verified using your authorization code. You can now sign in and access the moderation dashboard."
              : "Your account has been created. You can now sign in and start discovering events."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push("/login")}>
              Sign In Now →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push("/")}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /></div>

      <div className="auth-container fade-in">
        <div className="auth-header">
          <div className="auth-logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <div className="logo-icon">⚡</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase" }}>
              Academic Events <span style={{ color: "var(--accent-primary)" }}>Hub</span>
            </span>
          </div>
          <h1>{step === 1 ? "Join AEH" : `Sign Up as ${selectedRole?.label}`}</h1>
          <p>{step === 1 ? "Select your role to get started" : "Fill in your details to create your account"}</p>
        </div>

        {/* Step indicator */}
        <div className="auth-steps">
          <div className={`auth-step ${step >= 1 ? "active" : ""}`}>
            <div className="auth-step-dot">1</div>
            <span>Select Role</span>
          </div>
          <div className="auth-step-line" />
          <div className={`auth-step ${step >= 2 ? "active" : ""}`}>
            <div className="auth-step-dot">2</div>
            <span>Your Details</span>
          </div>
        </div>

        {/* STEP 1: Role Selection */}
        {step === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "24px" }}>
            {ROLES.map(r => (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                style={{ 
                  border: "1px solid var(--border)", 
                  borderRadius: "12px", 
                  padding: "20px", 
                  cursor: "pointer", 
                  background: "var(--surface)", 
                  transition: "all 0.2s ease",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{r.icon}</div>
                <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: r.color }}>{r.label}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "Outfit, sans-serif", lineHeight: 1.4 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: Registration Form */}
        {step === 2 && (
          <div className="auth-form">
            {/* Common fields */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="e.g. Rahul Sharma" value={form.fullName} onChange={e => set("fullName", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Institutional Email *</label>
              <input className="form-input" type="email"
                placeholder={role === "student" ? "e.g. rahul.21cs@iitbhu.ac.in" : role === "faculty" ? "e.g. priya.cse@iitbhu.ac.in" : role === "scholar" ? "e.g. ankit.phd@iitbhu.ac.in" : "e.g. admin@iitbhu.ac.in"}
                value={form.email} onChange={e => set("email", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Student-specific */}
            {role === "student" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input className="form-input" placeholder="e.g. 21CS1045" value={form.rollNumber} onChange={e => set("rollNumber", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-select" value={form.year} onChange={e => set("year", e.target.value)}>
                    {["B.Tech 1st Year", "B.Tech 2nd Year", "B.Tech 3rd Year", "B.Tech 4th Year", "M.Tech 1st Year", "M.Tech 2nd Year", "Ph.D 1st Year", "Ph.D 2nd Year", "Ph.D 3rd Year", "Ph.D 4th Year", "Ph.D 5th Year+"].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Faculty-specific */}
            {role === "faculty" && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <select className="form-select" value={form.designation} onChange={e => set("designation", e.target.value)}>
                    <option value="" disabled>Select Designation</option>
                    {["Assistant Professor", "Associate Professor", "Professor", "Visiting Faculty", "Guest Lecturer", "Guest Professor", "Other"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Faculty ID</label>
                  <input className="form-input" placeholder="e.g. FAC-CS-2018-042" value={form.facultyId} onChange={e => set("facultyId", e.target.value)} />
                </div>
              </div>
            )}

            {/* Scholar-specific */}
            {role === "scholar" && (
              <>
                <div className="form-group">
                  <label className="form-label">Research Domain *</label>
                  <input className="form-input" placeholder="e.g. Quantum Information Theory, Machine Learning" value={form.researchDomain} onChange={e => set("researchDomain", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Supervisor Name</label>
                  <input className="form-input" placeholder="e.g. Prof. Arun Kumar" value={form.supervisor} onChange={e => set("supervisor", e.target.value)} />
                </div>
              </>
            )}

            {/* Admin-specific */}
            {role === "admin" && (
              <div className="form-group">
                <label className="form-label">Admin Authorization Code *</label>
                <input className="form-input" type="password" placeholder="Enter the code provided by IT department" value={form.adminCode} onChange={e => set("adminCode", e.target.value)} />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6, fontFamily: "Inter,sans-serif" }}>
                  Contact IT department at admin@iitbhu.ac.in to get your authorization code.
                </p>
              </div>
            )}

            {/* Password */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set("password", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className="form-input" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn btn-ghost btn-lg" onClick={() => { setStep(1); setRole(""); }}>
                ← Back
              </button>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating Account..." : `Create ${selectedRole?.label} Account →`}
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>Already have an account? <a onClick={() => router.push("/login")} style={{ color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600 }}>Sign in</a></p>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
