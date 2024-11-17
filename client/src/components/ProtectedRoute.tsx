import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: authStatus, error } = useSWR("/api/auth/status", {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (authStatus) {
      if (!authStatus.authenticated) {
        setLocation('/login');
      } else if (!authStatus.hasPaid) {
        // Use window.location.href for external URLs
        window.location.href = 'https://buy.stripe.com/7sI9D75xu8jRcnK289';
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    } else if (error) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setLocation('/login');
    }
  }, [authStatus, error, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white/60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60 mx-auto mb-4" />
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
