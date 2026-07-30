import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
