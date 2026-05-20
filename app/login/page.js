"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  { id: "student", icon: "🎓", label: "Student", color: "#6366f1" },
  { id: "faculty", icon: "👨‍🏫", label: "Faculty", color: "#10b981" },
  { id: "scholar", icon: "🔬", label: "Research Scholar", color: "#8b5cf6" },
  { id: "admin", icon: "🛡️", label: "Administrator", color: "#f59e0b" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedRole = ROLES.find(r => r.id === role);

  const handleLogin = () => {
    if (!email.trim()) { setToast("⚠️ Please enter your email"); setTimeout(() => setToast(null), 3000); return; }
    if (!password.trim()) { setToast("⚠️ Please enter your password"); setTimeout(() => setToast(null), 3000); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      let isValid = false;
      let redirectRole = role;
      const storedUser = localStorage.getItem("currentUser");
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.email === email.trim() && user.password === password) {
            isValid = true;
            redirectRole = user.role || role;
          }
        } catch (e) {}
      }
      
      // Fallback mock accounts matching the database seed
      const MOCK_DB = [
        { email: "ashish@iitbhu.ac.in", password: "password123", fullName: "Ashish Kumar", role: "student" },
        { email: "priya@iitbhu.ac.in", password: "password123", fullName: "Dr. Priya Sharma", role: "faculty" },
        { email: "ankit@iitbhu.ac.in", password: "password123", fullName: "Ankit Verma", role: "scholar" },
        { email: "admin@iitbhu.ac.in", password: "admin123", fullName: "System Admin", role: "admin" }
      ];

      const mockUser = MOCK_DB.find(u => u.email === email.trim() && u.password === password);
      if (mockUser) {
        isValid = true;
        redirectRole = mockUser.role;
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
      }

      if (isValid) {
        setToast("✅ Login successful! Redirecting...");
        setTimeout(() => router.push(`/${redirectRole}`), 1000);
      } else {
        setToast("❌ Invalid email or password. Please try again.");
        setTimeout(() => setToast(null), 3000);
      }
    }, 1200);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div className="auth-container fade-in">
        <div className="auth-header">
          <div className="auth-logo" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
            <div className="logo-icon">⚡</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase" }}>
              Campus<span style={{ color: "var(--accent-primary)" }}>Buzz</span>
            </span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your CampusBuzz account</p>
        </div>

        {/* Role Selector */}
        <div className="auth-role-selector">
          {ROLES.map(r => (
            <button
              key={r.id}
              className={`auth-role-chip ${role === r.id ? "active" : ""}`}
              onClick={() => setRole(r.id)}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <div className="auth-form">
          <div className="form-group">
            <label className="form-label">
              {role === "student" ? "University Email / Roll Number" : role === "admin" ? "Admin Email" : "Institutional Email"}
            </label>
            <input
              className="form-input"
              type="email"
              placeholder={role === "student" ? "e.g. rahul.21cs@iitbhu.ac.in" : role === "faculty" ? "e.g. priya.cse@iitbhu.ac.in" : role === "scholar" ? "e.g. ankit.phd@iitbhu.ac.in" : "e.g. admin@iitbhu.ac.in"}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontFamily: "Inter,sans-serif" }}>Forgot password?</a>
            </div>
            <input
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ marginTop: 8 }}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : `Sign in as ${selectedRole.label} →`}
          </button>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="btn btn-secondary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          🏛️ Sign in with Institute SSO
        </button>

        <div className="auth-footer">
          <p>Don&apos;t have an account? <a onClick={() => router.push("/signup")} style={{ color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600 }}>Sign up</a></p>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
