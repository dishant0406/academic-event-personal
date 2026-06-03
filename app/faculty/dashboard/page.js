"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FacultyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch User
        const userRes = await fetch("https://academic-event-7bk1.vercel.app/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = await userRes.json();
        
        if (userData.success) {
          if (userData.user.role !== "faculty") {
            router.push("/");
            return;
          }
          setUser(userData.user);

          // Fetch Faculty's Events (using status filter or just fetch all and filter client side for MVP)
          // To fetch my events properly, backend events API doesn't have a /my-events endpoint yet.
          // Let's fetch all events and filter by createdBy for MVP.
          const eventsRes = await fetch(`https://academic-event-7bk1.vercel.app/api/events?limit=100`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const eventsData = await eventsRes.json();
          
          if (eventsData.success) {
            const myEvents = eventsData.events.filter(e => 
              e.createdBy?._id === userData.user.id || e.createdBy === userData.user.id
            );
            setEvents(myEvents);
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndEvents();
  }, [router]);

  if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>Loading dashboard...</div>;

  return (
    <div className="section" style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", marginBottom: 8 }}>Faculty Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Welcome back, {user.fullName}</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push("/faculty/submit")}>
          + Submit New Event
        </button>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: "12px", border: "1px solid var(--border)", padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.2rem", marginBottom: "1.5rem" }}>My Submitted Events</h2>
        
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
            You haven't submitted any events yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "12px" }}>Event Title</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Registrations</th>
                <th style={{ padding: "12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px 12px", fontWeight: 600 }}>{event.title}</td>
                  <td style={{ padding: "16px 12px" }}>{new Date(event.date).toLocaleDateString()}</td>
                  <td style={{ padding: "16px 12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "50px", 
                      fontSize: "0.8rem", 
                      fontWeight: 600,
                      background: event.status === "approved" ? "rgba(16, 185, 129, 0.1)" : event.status === "rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)",
                      color: event.status === "approved" ? "#10b981" : event.status === "rejected" ? "#ef4444" : "#f59e0b" 
                    }}>
                      {event.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "16px 12px" }}>{event.registrations} / {event.capacity || 200}</td>
                  <td style={{ padding: "16px 12px" }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/events/${event._id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
