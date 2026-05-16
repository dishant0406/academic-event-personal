"use client";
import { useRouter } from "next/navigation";
import { EVENTS, FEATURES } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const ROLES = [
  {
    id: "student", icon: "🎓", label: "Student", color: "#6366f1",
    desc: "Discover events, register, earn certificates",
    features: ["📰 Personalized event feed", "🔔 Smart notifications", "⭐ Bookmark & RSVP", "📜 Attendance certificates", "📅 Calendar sync"]
  },
  {
    id: "faculty", icon: "👨‍🏫", label: "Faculty", color: "#10b981",
    desc: "Create, manage, and track your academic events",
    features: ["➕ Simple event submission", "📊 Registration analytics", "✏️ Edit & cancel events", "🔔 Hosting reminders", "📈 Reach tracking"]
  },
  {
    id: "scholar", icon: "🔬", label: "Research Scholar", color: "#8b5cf6",
    desc: "Advanced search & cross-department discovery",
    features: ["🔍 Advanced search filters", "🏛️ Cross-department discovery", "🎬 Past event recordings", "📥 ICS/Calendar export", "📚 Research domain alerts"]
  },
  {
    id: "admin", icon: "🛡️", label: "Administrator", color: "#f59e0b",
    desc: "Moderate, analyze, and manage the platform",
    features: ["✅ Approval workflows", "📊 University-wide analytics", "⭐ Feature events", "👥 User management", "⚙️ Platform settings"]
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="hero-content fade-in">
          <div className="hero-badge">🎓 Banaras Hindu University & Beyond</div>
          <h1>Discover Every Academic Event On Campus</h1>
          <p>One platform to find seminars, workshops, conferences, guest lectures, and training programs. Never miss an opportunity to learn, collaborate, and grow.</p>
          <div className="hero-stats">
            {[["1,200+","Events Published"],["45","Departments"],["28,000+","Students Reached"],["95%","Satisfaction"]].map(([n,l])=>(
              <div key={l} className="hero-stat"><div className="number">{n}</div><div className="label">{l}</div></div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 32 }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push("/signup")} style={{ background: "var(--accent-primary)", paddingLeft: 32, paddingRight: 32 }}>
              Get Started — Sign Up →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push("/login")} style={{ paddingLeft: 32, paddingRight: 32 }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ROLE SELECTION */}
      <section className="section">
        <div className="section-header">
          <h2>Choose Your Role</h2>
          <p>Select how you want to use the platform</p>
        </div>
        <div className="role-grid">
          {ROLES.map(r => (
            <div key={r.id} className="role-card" onClick={() => router.push(`/${r.id}`)}
              style={{ borderColor: "var(--border)" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = r.color + "66"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              <div className="role-card-icon" style={{ background: r.color + "18" }}>{r.icon}</div>
              <h3>{r.label}</h3>
              <p>{r.desc}</p>
              <ul className="role-features">
                {r.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 16, background: r.color }}>
                Enter as {r.label} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED EVENTS PREVIEW */}
      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <p>A glimpse of what&apos;s happening across campus</p>
          </div>
          <div className="events-grid">
            {EVENTS.filter(e => e.featured).slice(0, 3).map(e => (
              <div key={e.id} className="event-card">
                <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color}22, ${e.color}08)` }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "3rem", opacity: 0.3 }}>
                    {e.type === "conference" ? "🏛️" : e.type === "workshop" ? "🔧" : "📋"}
                  </div>
                  <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                </div>
                <div className="event-card-body">
                  <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                  <h3 className="event-card-title">{e.title}</h3>
                  <p className="event-card-desc">{e.description}</p>
                  <div className="event-card-meta">
                    <span className="event-card-dept">🏫 {e.department}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "Inter,sans-serif" }}>{e.registrations}+ registered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="section-header">
          <h2>Why CampusBuzz?</h2>
          <p>Built for the unique needs of large universities</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon" style={{ background: f.gradient }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>⚡ CampusBuzz</h3>
            <p>Never miss the buzz. The academic pulse of your campus — built for IIT BHU and beyond.</p>
          </div>
          <div className="footer-col"><h4>Platform</h4><a href="#">Discover</a><a href="#">Calendar</a><a href="#">Submit Event</a></div>
          <div className="footer-col"><h4>Resources</h4><a href="#">Documentation</a><a href="#">API Access</a><a href="#">Help Center</a></div>
          <div className="footer-col"><h4>Contact</h4><a href="#">acadevents@bhu.ac.in</a><a href="#">Varanasi, UP 221005</a></div>
        </div>
        <div className="footer-bottom">© 2025 CampusBuzz — Never Miss the Buzz. Made with ❤️ at IIT BHU.</div>
      </footer>
    </>
  );
}
