import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth-store';

export default function ProtectedRoute() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const expiresAt = useAuthStore((s) => s.expiresAt);
  const logout = useAuthStore((s) => s.logout);

  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    tickRef.current = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
    };
  }, []);

  const isExpired =
    typeof expiresAt === 'number' && now >= expiresAt;

  useEffect(() => {
    if (isExpired && token) {
      logout();
    }
  }, [isExpired, token, logout]);

  if (!user || isExpired) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
