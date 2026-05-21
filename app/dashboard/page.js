"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectsInput, setSubjectsInput] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user profile.');
        }

        const data = await res.json();
        const userData = data.data || data.user || data;
        setUser(userData);
        
        const subjects = userData.preferences?.subscribedSubjects || userData.subscribedSubjects || [];
        if (Array.isArray(subjects)) {
          setSubjectsInput(subjects.join(', '));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      
      const res = await fetch('http://localhost:5000/api/users/preferences', {
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
    } catch (err) {
      setSaveMessage(`❌ Error: ${err.message}`);
    }
  };

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

  const bookmarks = user.bookmarks || [];
  const initials = user.fullName ? user.fullName.substring(0, 2).toUpperCase() : "US";

  return (
    <>
      <div className="dashboard-header">
        <h1>User Dashboard 🚀</h1>
        <p>Manage your preferences and bookmarks</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Profile Card */}
        <div className="form-container" style={{ maxWidth: "100%", margin: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, borderBottom: "1px solid var(--border)", paddingBottom: "24px", marginBottom: "24px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "white", fontWeight: "bold" }}>
              {initials}
            </div>
            <div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>{user.fullName || user.name}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontFamily: "Outfit, sans-serif", textTransform: "capitalize" }}>
                Role: {user.role}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontFamily: "Outfit, sans-serif", marginTop: 4 }}>
                {user.email}
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", fontFamily: "Space Grotesk, sans-serif" }}>Preferences</h2>
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
                Save Preferences
              </button>
              {saveMessage && (
                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: saveMessage.includes('✅') ? "var(--success, #10b981)" : "var(--danger, #ef4444)" }}>
                  {saveMessage}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Bookmarks Card */}
        <div className="form-container" style={{ maxWidth: "100%", margin: 0 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", fontFamily: "Space Grotesk, sans-serif", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.8rem" }}>🔖</span> My Bookmarks
          </h2>
          
          {bookmarks.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {bookmarks.map((bookmark, index) => {
                const eventId = typeof bookmark === 'object' ? bookmark._id || bookmark.id : bookmark;
                return (
                  <div key={index} style={{ 
                    padding: "16px", 
                    border: "1px solid var(--border)", 
                    borderRadius: "8px",
                    background: "var(--surface)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Event Reference</p>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>ID: {eventId}</p>
                    </div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => router.push(`/events/${eventId}`)}
                    >
                      View Details →
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg)", borderRadius: "8px", border: "1px dashed var(--border)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}>📭</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>You have no bookmarked events.</p>
              <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => router.push("/")}>
                Discover Events
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </>
  );
}
