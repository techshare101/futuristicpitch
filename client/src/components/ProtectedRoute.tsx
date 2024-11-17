import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Keep the state management for future restoration
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to bypass auth
  const [isLoading, setIsLoading] = useState(false); // Set to false to skip loading state

  // Keep the SWR hook for future restoration but don't use its results
  const { data: authStatus, error } = useSWR("/api/auth/status", {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  // Keep the effect for future restoration but make it no-op
  useEffect(() => {
    // Commented out for temporary bypass
    // if (authStatus) {
    //   setIsAuthenticated(authStatus.authenticated);
    //   setIsLoading(false);
    // } else if (error) {
    //   setIsAuthenticated(false);
    //   setIsLoading(false);
    // }
  }, [authStatus, error]);

  // Directly return children without any checks
  return <>{children}</>;
}