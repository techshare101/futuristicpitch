import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import useSWR from "swr";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Add SWR for auth status with more frequent revalidation
  const { data: authStatus, error } = useSWR("/api/auth/status", {
    refreshInterval: 15000, // Check every 15 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Only retry up to 3 times
      if (retryCount >= 3) return;
      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount }), 5000);
    },
  });

  useEffect(() => {
    const handleAuthStatus = async () => {
      try {
        console.log("[ProtectedRoute] Checking auth status:", authStatus);
        
        if (authStatus) {
          if (!authStatus.authenticated) {
            console.log("[ProtectedRoute] User not authenticated, redirecting to login");
            toast({
              title: "Authentication required",
              description: "Please log in to continue",
              variant: "destructive",
            });
            setLocation('/login');
            setIsAuthenticated(false);
          } else {
            console.log("[ProtectedRoute] User authenticated");
            setIsAuthenticated(true);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[ProtectedRoute] Error handling auth status:", err);
        toast({
          title: "Authentication Error",
          description: "An error occurred while checking authentication",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        setLocation('/login');
      }
    };

    handleAuthStatus();
  }, [authStatus, setLocation, toast]);

  useEffect(() => {
    if (error) {
      console.error("[ProtectedRoute] Auth status error:", error);
      toast({
        title: "Authentication Error",
        description: "Please try logging in again",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      setIsLoading(false);
      setLocation('/login');
    }
  }, [error, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white/60 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
