import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/services/auth";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsAuthenticated(false);
      navigate("/");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, allowedRoles, user]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (isAuthenticated === false) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
