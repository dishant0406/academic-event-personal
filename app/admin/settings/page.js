"use client";
export default function AdminSettings() {
  return (
    <>
      <div className="dashboard-header"><h1>Settings ⚙️</h1><p>Platform configuration</p></div>
      <div className="form-container" style={{ maxWidth: "100%" }}>
        <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 20 }}>General Settings</h3>
        <div className="form-group"><label className="form-label">University Name</label><input className="form-input" defaultValue="Indian Institute of Technology (BHU) Varanasi" /></div>
        <div className="form-group"><label className="form-label">Platform Name</label><input className="form-input" defaultValue="Academic Events Hub (AEH)" /></div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" defaultValue="admin@iitbhu.ac.in" /></div>
          <div className="form-group"><label className="form-label">Support Email</label><input className="form-input" defaultValue="support@aeh.in" /></div>
        </div>
        <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 20, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>Event Settings</h3>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Require Approval</label><select className="form-select"><option>Yes — all events require admin approval</option><option>No — auto-publish faculty events</option></select></div>
          <div className="form-group"><label className="form-label">Default Event Capacity</label><input className="form-input" type="number" defaultValue="200" /></div>
        </div>
        <h3 style={{ fontFamily: "Inter,sans-serif", fontSize: "1rem", marginBottom: 20, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>Notification Settings</h3>
        <div className="form-group"><label className="form-label">Send notifications for</label><select className="form-select"><option>All new events</option><option>Only featured events</option><option>Events matching user interests</option></select></div>
        <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", background: "#f59e0b", color: "#1a1a1a", marginTop: 16 }}>Save Settings</button>
      </div>
    </>
  );
}
