"use client";
import { usePathname, useRouter } from "next/navigation";

const ROLE_CONFIG = {
  student: {
    label: "Student",
    icon: "🎓",
    color: "#6366f1",
    links: [
      { href: "/student", label: "My Feed", icon: "📰" },
      { href: "/student/discover", label: "Discover", icon: "🔍" },
      { href: "/student/submit", label: "Create Event", icon: "➕" },
      { href: "/student/events", label: "My Events", icon: "📋" },
      { href: "/student/calendar", label: "Calendar", icon: "📅" },
      { href: "/student/bookmarks", label: "Bookmarks", icon: "⭐" },
      { href: "/student/registrations", label: "My Registrations", icon: "🎫" },
      { href: "/student/cross-dept", label: "Cross-Department", icon: "🏛️" },
      { href: "/student/recordings", label: "Recordings", icon: "🎬" },
      { href: "/student/search", label: "Advanced Search", icon: "🔍" },
      { href: "/student/profile", label: "My Profile", icon: "👤" },
    ],
  },
  faculty: {
    label: "Faculty",
    icon: "👨‍🏫",
    color: "#10b981",
    links: [
      { href: "/faculty", label: "Dashboard", icon: "📊" },
      { href: "/faculty/submit", label: "Create Event", icon: "➕" },
      { href: "/faculty/events", label: "My Events", icon: "📋" },
      { href: "/faculty/analytics", label: "Analytics", icon: "📈" },
      { href: "/faculty/calendar", label: "Calendar", icon: "📅" },
      { href: "/faculty/profile", label: "My Profile", icon: "👤" },
    ],
  },

  admin: {
    label: "Administrator",
    icon: "🛡️",
    color: "#f59e0b",
    links: [
      { href: "/admin", label: "Dashboard", icon: "📊" },
      { href: "/admin/events", label: "All Events", icon: "📋" },
      { href: "/admin/analytics", label: "Analytics", icon: "📈" },
      { href: "/admin/users", label: "User Management", icon: "👥" },
      { href: "/admin/featured", label: "Featured Events", icon: "⭐" },
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
  },
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const router = useRouter();
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => router.push("/")} style={{ cursor: "pointer" }}>
        <div className="logo-icon">⚡</div>
        <span>Academic Events Hub <span style={{ color: "var(--accent-primary)" }}>(AEH)</span></span>
      </div>

      <div className="sidebar-role" style={{ borderColor: config.color + "33", background: config.color + "11" }}>
        <span style={{ fontSize: "1.3rem" }}>{config.icon}</span>
        <div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Logged in as</div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{config.label}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {config.links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <a
              key={link.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              onClick={() => router.push(link.href)}
              style={isActive ? { borderLeftColor: config.color, color: config.color, background: config.color + "11" } : {}}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={() => router.push("/")}>
          <span className="sidebar-link-icon">🚪</span>
          Switch Role
        </button>
      </div>
    </aside>
  );
}
