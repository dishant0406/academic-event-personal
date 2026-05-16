"use client";
import Sidebar from "@/components/Sidebar";

export default function ScholarLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar role="scholar" />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
