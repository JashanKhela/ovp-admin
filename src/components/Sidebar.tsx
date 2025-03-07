import { Link, useLocation } from "react-router-dom"; // 🟢 Import `useLocation`
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, Archive, LogOutIcon, Timer } from "lucide-react";
import Logo from "@/assets/logo.png";
import { Button } from "./ui/button";
import { getCurrentUser, logout } from "@/services/auth";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserRole(user.role);
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, []);

  return (
    <>
      <header className="lg:hidden bg-[#ACD1AF] text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-md">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={36} /> : <Menu size={36} />}
        </button>
        <h2 className="text-md font-bold">Okanagan Valley Produce Ltd.</h2>
      </header>


      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-[#ACD1AF] text-white shadow-lg w-64 p-4 transition-transform z-40 py-24 md:py-4 ",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative lg:w-60"
        )}
      >
        <div className="flex flex-col justify-center mb-4">
          <img src={Logo} alt="Okanagan Valley Produce" className="h-full w-full mx-auto" />
          <h2 className="text-xl font-bold mb-4 text-left">
            {`Welcome Back`} <br />
            {firstName} {lastName}
          </h2>
        </div>

        <nav className="space-y-2">
          {userRole === "admin" && (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition",
                  location.pathname === "/dashboard" ? "bg-gray-300" : ""
                )}
                onClick={() => setIsOpen(false)} 
              >
                <LayoutDashboard /> Dashboard
              </Link>
              <Link
                to="/dashboard/timesheets"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition",
                  location.pathname === "/dashboard/timesheets" ? "bg-gray-300" : ""
                )}
                onClick={() => setIsOpen(false)}
              >
                <Timer /> Timesheets
              </Link>
              <Link
                to="/dashboard/documents"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition",
                  location.pathname === "/dashboard/documents" ? "bg-gray-300" : ""
                )}
                onClick={() => setIsOpen(false)}
              >
                <Archive /> Documents
              </Link>
            </>
          )}
          {userRole === "employee" && (
            <Link
              to="/dashboard/record-time"
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition",
                location.pathname === "/dashboard/record-time" ? "bg-gray-300" : ""
              )}
              onClick={() => setIsOpen(false)}
            >
              <Timer/> Registrar Horas
            </Link>
          )}
          <Button
            onClick={logout}
            className="w-full text-gray-700 mt-2 bg-white hover:bg-red-500 hover:text-white"
          >
            Logout <LogOutIcon size={20} />
          </Button>
        </nav>
      </aside>

      {/* 🟢 Close Sidebar When Clicking Outside */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm lg:hidden z-30"
        />
      )}
    </>
  );
}
