"use client";
import Sidebar from "@/components/Sidebar";

export default function StudentLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role="student" />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
