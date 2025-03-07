import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Outlet will render nested pages */}
      <main className="flex-1 px-6  py-36 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}
