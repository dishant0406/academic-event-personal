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
    department: DEPARTMENTS[0], rollNumber: "", year: "1st Year",
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

  const handleSubmit = () => {
    if (!form.fullName.trim()) { showToast("⚠️ Please enter your full name"); return; }
    if (!form.email.trim()) { showToast("⚠️ Please enter your email"); return; }
    if (!form.password || form.password.length < 6) { showToast("⚠️ Password must be at least 6 characters"); return; }
    if (form.password !== form.confirmPassword) { showToast("⚠️ Passwords do not match"); return; }
    if (role === "admin" && !form.adminCode.trim()) { showToast("⚠️ Please enter your admin authorization code"); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg"><div className="orb orb-1" /><div className="orb orb-2" /></div>
        <div className="auth-container fade-in" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: 20 }}>🎉</div>
          <h1 style={{ marginBottom: 12 }}>Account Created!</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 8, fontFamily: "Inter,sans-serif" }}>
            Welcome to CampusBuzz, <strong>{form.fullName}</strong>!
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 32, fontFamily: "Inter,sans-serif" }}>
            {role === "admin"
              ? "Your admin account is pending verification. You'll receive an email once approved."
              : "Your account has been created. You can now sign in and start discovering events."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-primary btn-lg" style={{ background: selectedRole?.color }} onClick={() => router.push("/login")}>
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
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700 }}>
              Campus<span style={{ color: "var(--accent-primary)" }}>Buzz</span>
            </span>
          </div>
          <h1>{step === 1 ? "Join CampusBuzz" : `Sign Up as ${selectedRole?.label}`}</h1>
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
          <div className="auth-role-grid">
            {ROLES.map(r => (
              <div
                key={r.id}
                className="auth-role-card"
                onClick={() => handleSelectRole(r.id)}
                onMouseEnter={e => e.currentTarget.style.borderColor = r.color + "66"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div className="auth-role-card-icon" style={{ background: r.color + "18" }}>{r.icon}</div>
                <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", fontWeight: 700 }}>{r.label}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "Inter,sans-serif" }}>{r.desc}</p>
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
                    {["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "M.Tech 1st Year", "M.Tech 2nd Year"].map(y => <option key={y}>{y}</option>)}
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
                    {["Assistant Professor", "Associate Professor", "Professor", "Visiting Faculty", "Guest Lecturer"].map(d => <option key={d}>{d}</option>)}
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
                style={{ flex: 1, justifyContent: "center", background: selectedRole?.color }}
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
