"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    registeredEvents: [],
    bookmarkedEvents: [],
    recommendedEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [subjectsInput, setSubjectsInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch User Profile
        const resUser = await fetch('https://academic-event-7bk1.vercel.app/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resUser.ok) {
          if (resUser.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user profile.');
        }

        const dataUser = await resUser.json();
        const userData = dataUser.data || dataUser.user || dataUser;
        setUser(userData);
        
        const subjects = userData.preferences?.subscribedSubjects || userData.subscribedSubjects || [];
        if (Array.isArray(subjects)) {
          setSubjectsInput(subjects.join(', '));
        }

        // Fetch Dashboard Events
        const resDash = await fetch('https://academic-event-7bk1.vercel.app/api/users/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resDash.ok) {
          const dashData = await resDash.json();
          setDashboardData({
            registeredEvents: dashData.registeredEvents || [],
            bookmarkedEvents: dashData.bookmarkedEvents || [],
            recommendedEvents: dashData.recommendedEvents || []
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaveMessage('');
    try {
      const token = localStorage.getItem('token');
      const subjectsArray = subjectsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '');
      
      const res = await fetch('https://academic-event-7bk1.vercel.app/api/users/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscribedSubjects: subjectsArray })
      });

      if (!res.ok) {
        throw new Error('Failed to update preferences.');
      }

      setSaveMessage('✅ Preferences updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Reload page to refresh recommendations based on new subjects
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
  };

  const EventCard = ({ event, badge }) => (
    <div 
      className="card" 
      style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px", cursor: "pointer", transition: "transform 0.2s" }}
      onClick={() => router.push(`/events/${event._id || event.id}`)}
      onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <span style={{ 
          background: event.color ? `${event.color}22` : "var(--accent-secondary)", 
          color: event.color || "var(--accent-primary)", 
          padding: "4px 10px", 
          borderRadius: "100px", 
          fontSize: "0.75rem", 
          fontWeight: 600,
          textTransform: "uppercase"
        }}>
          {event.type || 'Event'}
        </span>
        {badge && (
          <span style={{ fontSize: "1.2rem" }} title={badge.title}>{badge.icon}</span>
        )}
      </div>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", fontWeight: 700, color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {event.title}
      </h3>
      <div style={{ flex: 1 }}></div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>📅</span> {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>📍</span> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.venue || event.location}</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="spinner" style={{ width: 40, height: 40, border: "4px solid var(--border)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "var(--danger)" }}>
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "US";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand" style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          <div className="logo-icon">⚡</div>
          Academic Events Hub
        </div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/calendar">Calendar</a>
        </div>
      </nav>

      <div style={{ maxWidth: "1200px", margin: "100px auto 40px", padding: "0 20px" }}>
        
        {/* Welcome Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: "40px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white", fontWeight: "bold", boxShadow: "var(--shadow-md)" }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "2.2rem", fontWeight: 700, margin: 0 }}>Welcome back, {user.fullName.split(' ')[0]}! 👋</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: 4 }}>
              Here is your personal academic hub.
            </p>
          </div>
        </div>

        {/* Grid Layout for Dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
          
          {/* Main Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px", gridColumn: "1 / -1" }}>
            
            {/* Registered Events Section */}
            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "center", gap: "10px" }}>
                <span>✅</span> Attending Events ({dashboardData.registeredEvents.length})
              </h2>
              {dashboardData.registeredEvents.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {dashboardData.registeredEvents.map(evt => (
                    <EventCard key={evt._id} event={evt} badge={{ icon: '✅', title: 'Registered' }} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "16px" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>You haven't registered for any upcoming events yet.</p>
                  <button className="btn btn-secondary" style={{ marginTop: "16px" }} onClick={() => router.push("/")}>Browse Events</button>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px", marginTop: "20px" }}>
              
              {/* Bookmarked Events Section */}
              <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>🔖</span> Saved For Later
                </h2>
                {dashboardData.bookmarkedEvents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {dashboardData.bookmarkedEvents.map(evt => (
                      <div key={evt._id} onClick={() => router.push(`/events/${evt._id}`)} style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseOut={e => e.currentTarget.style.transform = "translateX(0)"}>
                        <div>
                          <h4 style={{ fontWeight: 600, fontSize: "1rem", color: "var(--text-primary)", marginBottom: "4px" }}>{evt.title}</h4>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{new Date(evt.date).toLocaleDateString()} • {evt.type}</span>
                        </div>
                        <span style={{ color: "var(--accent-primary)" }}>→</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>No bookmarked events.</p>
                  </div>
                )}
              </div>

              {/* Recommended Events Section */}
              <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span>✨</span> Recommended For You
                </h2>
                {dashboardData.recommendedEvents.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    {dashboardData.recommendedEvents.map(evt => (
                      <EventCard key={evt._id} event={evt} />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: "30px", textAlign: "center", background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>No recommendations available right now.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Preferences Form */}
            <div className="form-container" style={{ maxWidth: "100%", margin: "20px 0 0 0" }}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", fontFamily: "Space Grotesk, sans-serif" }}>⚙️ Personalize Your Recommendations</h2>
              <form onSubmit={handlePreferencesSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="subjects">
                    Subscribed Subjects
                  </label>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>Enter subjects separated by commas (e.g. Computer Science, AI, Physics). We'll use these to recommend events.</p>
                  <input
                    type="text"
                    id="subjects"
                    className="form-input"
                    value={subjectsInput}
                    onChange={(e) => setSubjectsInput(e.target.value)}
                    placeholder="e.g., Computer Science, Physics, Mathematics"
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <button type="submit" className="btn btn-primary">
                    Update Preferences
                  </button>
                  {saveMessage && (
                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: saveMessage.includes('✅') ? "var(--success, #10b981)" : "var(--danger, #ef4444)" }}>
                      {saveMessage}
                    </span>
                  )}
                </div>
              </form>
            </div>
            
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
