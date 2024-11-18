import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, error, getToken } = useUser();

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          console.log("[ProtectedRoute] No token found, redirecting to login");
          throw new Error("Authentication required");
        }

        if (user) {
          console.log("[ProtectedRoute] User authenticated:", user.id);
          setIsAuthenticated(true);
        } else if (error) {
          console.log("[ProtectedRoute] Auth error:", error);
          throw error;
        }
      } catch (err) {
        console.error("[ProtectedRoute] Auth validation error:", err);
        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        setIsAuthenticated(false);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, [user, error, setLocation, toast, getToken]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white/60 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, component will be unmounted during redirect
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}