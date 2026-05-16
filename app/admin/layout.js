"use client";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
