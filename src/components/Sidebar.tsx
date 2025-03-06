import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X, LayoutDashboard, Archive, LogOutIcon, Timer } from "lucide-react";
import Logo from "@/assets/logo.png"; // Use @ alias if configured
import { Button } from "./ui/button";
import { getCurrentUser, logout } from "@/services/auth";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setUserRole(user.role);
    if (user) setFirstName(user.first_name);
    if (user) setLastName(user.last_name);
  }, []);
  return (
    <>
      {/* 🟢 Move Menu Button to Top Right */}
      <div className="absolute top-4 left-4 lg:hidden z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={36} /> : <Menu size={36} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-[#ACD1AF] text-white shadow-lg w-64 p-4 transition-transform z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative lg:w-60"
        )}
      >
        <div className="flex flex-col justify-center mb-4">
          <img
            src={Logo}
            alt="Okanagan Valley Produce"
            className="h-[300] w-[300px] mx-auto"
          />
          <h2 className="text-xl font-bold mb-4 text-left">
           {`Welcome Back`} <br />
            {firstName} {lastName}
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {userRole === "admin" && (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <LayoutDashboard /> Dashboard
              </Link>
              <Link
                to="/dashboard/timesheets"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <Timer /> Timesheets
              </Link>
              <Link
                to="/dashboard/documents"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <Archive /> Documents
              </Link>

            </>
          )}
          {userRole === "employee" && (
            <Link to="/dashboard/record-time"  className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-200 transition">
              🕒 Registrar Horas
            </Link>
          )}
          <Button
            onClick={logout}
            className=" w-full text-gray-700 mt-2 bg-white hover:bg-red-500 hover:text-white"
          >
            Logout <LogOutIcon size={20} />
          </Button>
        </nav>
      </aside>

      {/* 🟢 Update Background Overlay to Semi-Transparent White */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm lg:hidden z-30"
        />
      )}
    </>
  );
}
