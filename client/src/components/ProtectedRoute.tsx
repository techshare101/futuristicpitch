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
          console.log("[ProtectedRoute] No token found");
          throw new Error("No authentication token found");
        }

        // Check if token is properly formatted
        if (!token.match(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)) {
          console.error("[ProtectedRoute] Invalid token format");
          throw new Error("Invalid token format");
        }

        if (user) {
          console.log("[ProtectedRoute] User authenticated:", user.id);
          setIsAuthenticated(true);
        } else if (error) {
          console.error("[ProtectedRoute] Auth error:", error);
          if (error.message?.includes('expired')) {
            throw new Error("Authentication token has expired");
          }
          throw error;
        }
      } catch (err) {
        console.error("[ProtectedRoute] Auth validation error:", err);
        let errorMessage = "Please log in to continue";
        
        if (err instanceof Error) {
          if (err.message.includes('expired')) {
            errorMessage = "Your session has expired. Please log in again";
          } else if (err.message.includes('invalid')) {
            errorMessage = "Invalid authentication. Please log in again";
          }
        }

        toast({
          title: "Authentication Required",
          description: errorMessage,
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
