import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import useSWR from "swr";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [lastRedirect, setLastRedirect] = useState<string | null>(null);

  const { data: authStatus, error: authError } = useSWR("/api/auth/status");
  const { data: paymentStatus, error: paymentError } = useSWR(
    authStatus?.authenticated ? "/api/payment/status" : null
  );

  useEffect(() => {
    if (isChecking && !authError && !paymentError) {
      // If not authenticated, redirect to login instead of signup
      if (!authStatus?.authenticated) {
        if (lastRedirect !== "/login") {
          setLastRedirect("/login");
          setLocation("/login");
        }
        setIsChecking(false);
      } else if (!paymentStatus?.paid) {
        if (lastRedirect !== "/payment") {
          setLastRedirect("/payment");
          setLocation("/payment");
        }
        setIsChecking(false);
      } else {
        // Only redirect to getting-started if we're on the root path
        if (window.location.pathname === "/") {
          if (lastRedirect !== "/getting-started") {
            setLastRedirect("/getting-started");
            setLocation("/getting-started");
          }
        }
        setIsChecking(false);
      }
    }
  }, [authStatus, paymentStatus, authError, paymentError, setLocation, lastRedirect]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (authError || paymentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white">Something went wrong. Please try again.</div>
      </div>
    );
  }

  if (!authStatus?.authenticated || !paymentStatus?.paid) {
    return null;
  }

  return <>{children}</>;
}
