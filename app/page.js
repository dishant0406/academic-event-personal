"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FEATURES, DEPARTMENTS, EVENT_TYPES } from "@/lib/data";

function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const router = useRouter();
  
  // State for events
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // State for filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  // Fetch Featured Events (only on mount)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/events?featured=true&limit=3");
        const data = await res.json();
        if (data.success) {
          setFeaturedEvents(data.events);
        }
      } catch (err) {
        console.error("Failed to fetch featured events", err);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch Upcoming Events (when filters or page changes)
  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      try {
        let url = `http://localhost:5000/api/events?page=${page}&limit=6`;
        if (typeFilter !== "all") url += `&type=${typeFilter}`;
        if (deptFilter !== "All Departments") url += `&department=${encodeURIComponent(deptFilter)}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.success) {
          if (page === 1) {
            setUpcomingEvents(data.events);
          } else {
            setUpcomingEvents(prev => [...prev, ...data.events]);
          }
          setHasMore(data.page < data.pages);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming events", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcoming();
  }, [typeFilter, deptFilter, page]);

  // Handlers for filters
  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    setPage(1); // reset to page 1 on filter change
  };

  const handleDeptChange = (e) => {
    setDeptFilter(e.target.value);
    setPage(1); // reset to page 1 on filter change
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="logo-icon">⚡</div>
          CampusBuzz
        </div>
        <div className="navbar-links">
          <a href="#" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Home</a>
          <a href="#events">Events</a>
          <a href="#features">Features</a>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/login")}>Login</button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push("/signup")}>Sign Up</button>
        </div>
      </nav>

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
            <button className="btn btn-primary btn-lg" onClick={() => router.push("/signup")} style={{ paddingLeft: 32, paddingRight: 32 }}>
              Get Started — Sign Up →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push("/login")} style={{ paddingLeft: 32, paddingRight: 32 }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      {featuredEvents.length > 0 && (
        <section className="section" style={{ background: "rgba(99, 102, 241, 0.02)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div className="section-header" style={{ marginBottom: "2rem" }}>
              <h2>⭐ Featured Events</h2>
              <p>Highly anticipated events handpicked for you</p>
            </div>
            <div className="events-grid">
              {featuredEvents.map(e => (
                <div key={e._id} className="event-card" style={{ border: "1px solid var(--primary-border)" }}>
                  <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color || '#6366f1'}22, ${e.color || '#6366f1'}08)` }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "3rem", opacity: 0.3 }}>
                      {e.type === "conference" ? "🏛️" : e.type === "workshop" ? "🔧" : "📋"}
                    </div>
                    <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                  </div>
                  <div className="event-card-body">
                    <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                    <h3 className="event-card-title">{e.title}</h3>
                    <div className="event-card-meta" style={{ marginTop: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>🕒 {e.time || 'Time TBA'}</span>
                      <span>📍 {e.venue || 'Venue TBA'}</span>
                    </div>
                    <p className="event-card-desc" style={{ marginTop: "0" }}>{e.description}</p>
                    <div className="event-card-meta">
                      <span className="event-card-dept">🏫 {e.department}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "Inter,sans-serif" }}>{e.registrations || 0}+ registered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DISCOVERY / LISTINGS */}
      <section id="events" className="section">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-header" style={{ marginBottom: "2rem" }}>
            <h2>Upcoming Events</h2>
            <p>A glimpse of what&apos;s happening across campus</p>
          </div>
          
          {/* FILTER BAR */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem", padding: "1rem", background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>Event Type:</span>
              <select 
                className="input-field" 
                style={{ padding: "8px 12px", width: "auto", minWidth: "150px" }}
                value={typeFilter}
                onChange={handleTypeChange}
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500 }}>Department:</span>
              <select 
                className="input-field" 
                style={{ padding: "8px 12px", width: "auto", minWidth: "200px" }}
                value={deptFilter}
                onChange={handleDeptChange}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* EVENTS FEED */}
          {upcomingEvents.length === 0 && !loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
              <h3>No events found</h3>
              <p>Try adjusting your filters to discover more events.</p>
              <button className="btn btn-ghost" onClick={() => { setTypeFilter("all"); setDeptFilter("All Departments"); }} style={{ marginTop: "1rem" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map(e => (
                <div key={e._id} className="event-card">
                  <div className="event-card-banner" style={{ background: `linear-gradient(135deg, ${e.color || '#6366f1'}22, ${e.color || '#6366f1'}08)` }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "3rem", opacity: 0.3 }}>
                      {e.type === "conference" ? "🏛️" : e.type === "workshop" ? "🔧" : "📋"}
                    </div>
                    <span className={`event-card-type type-${e.type}`}>{e.type}</span>
                  </div>
                  <div className="event-card-body">
                    <div className="event-card-date">📅 {fmtDate(e.date)}</div>
                    <h3 className="event-card-title">{e.title}</h3>
                    <div className="event-card-meta" style={{ marginTop: "0.5rem", marginBottom: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>🕒 {e.time || 'Time TBA'}</span>
                      <span>📍 {e.venue || 'Venue TBA'}</span>
                    </div>
                    <p className="event-card-desc" style={{ marginTop: "0" }}>{e.description}</p>
                    <div className="event-card-meta">
                      <span className="event-card-dept">🏫 {e.department}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: "Inter,sans-serif" }}>{e.registrations || 0}+ registered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION / LOAD MORE */}
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setPage(p => p + 1)} 
                disabled={loading}
                style={{ paddingLeft: "2rem", paddingRight: "2rem" }}
              >
                {loading ? "Loading..." : "Load More Events ↓"}
              </button>
            </div>
          )}
          
          {loading && upcomingEvents.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2rem", color: "var(--text-secondary)" }}>
              Loading more events...
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
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
          <div className="footer-col"><h4>Contact</h4><a href="#">campusbuzz@bhu.ac.in</a><a href="#">Varanasi, UP 221005</a></div>
        </div>
        <div className="footer-bottom">© 2026 CampusBuzz — Never Miss the Buzz. Made with ❤️ at IIT BHU.</div>
      </footer>
    </>
  );
}
