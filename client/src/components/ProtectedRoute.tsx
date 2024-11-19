import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "../hooks/use-user";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('returnTo', window.location.pathname);
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60" />
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
