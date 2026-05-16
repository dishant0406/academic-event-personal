"use client";
const USERS = [
  { id: 1, name: "Rahul Sharma", role: "Student", dept: "Computer Science", email: "rahul@iitbhu.ac.in" },
  { id: 2, name: "Dr. Priya Sharma", role: "Faculty", dept: "Computer Science", email: "priya@iitbhu.ac.in" },
  { id: 3, name: "Ankit Verma", role: "Scholar", dept: "Physics", email: "ankit@iitbhu.ac.in" },
  { id: 4, name: "Prof. Rajesh Verma", role: "Faculty", dept: "Physics", email: "rajesh@iitbhu.ac.in" },
  { id: 5, name: "Sneha Gupta", role: "Student", dept: "Mathematics", email: "sneha@iitbhu.ac.in" },
  { id: 6, name: "Dr. Anand Mishra", role: "Faculty", dept: "Mathematics", email: "anand@iitbhu.ac.in" },
  { id: 7, name: "Prateek Singh", role: "Student", dept: "Civil Engineering", email: "prateek@iitbhu.ac.in" },
  { id: 8, name: "Dr. Meena Gupta", role: "Admin", dept: "Central Library", email: "meena@iitbhu.ac.in" },
];
export default function AdminUsers() {
  return (
    <>
      <div className="dashboard-header"><h1>User Management 👥</h1><p>Manage users and roles</p></div>
      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <button className="btn btn-primary btn-sm" style={{ background: "#f59e0b", color: "#1a1a1a" }}>+ Add User</button>
        <div className="navbar-search" style={{ padding: "6px 14px" }}><span>🔍</span><input placeholder="Search users..." style={{ width: 200 }} /></div>
      </div>
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {USERS.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td><span className="status-badge" style={{ background: u.role==="Student"?"rgba(99,102,241,0.15)":u.role==="Faculty"?"rgba(16,185,129,0.15)":u.role==="Scholar"?"rgba(139,92,246,0.15)":"rgba(245,158,11,0.15)", color: u.role==="Student"?"#6366f1":u.role==="Faculty"?"#10b981":u.role==="Scholar"?"#8b5cf6":"#f59e0b" }}>{u.role}</span></td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{u.dept}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.email}</td>
                <td><div style={{ display: "flex", gap: 4 }}><button className="btn btn-ghost btn-sm">Edit</button><button className="btn btn-ghost btn-sm" style={{ color: "#f43f5e" }}>Remove</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
