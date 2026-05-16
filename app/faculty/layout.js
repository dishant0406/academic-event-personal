"use client";
import Sidebar from "@/components/Sidebar";

export default function FacultyLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role="faculty" />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
