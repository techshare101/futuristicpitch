import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, error, getToken } = useUser();

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;
    let mounted = true;

    const validateAuth = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          console.log("[ProtectedRoute] No token found");
          throw new Error("Please log in to continue");
        }

        // Validate token format
        const tokenPart = token.split(' ')[1];
        const tokenRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
        if (!tokenRegex.test(tokenPart)) {
          console.error("[ProtectedRoute] Invalid token format");
          throw new Error("Invalid authentication token");
        }

        if (user) {
          console.log("[ProtectedRoute] User authenticated:", user.id);
          if (mounted) {
            setIsAuthenticated(true);
            setAuthError(null);
          }
        } else if (error) {
          console.error("[ProtectedRoute] Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      } catch (err) {
        console.error("[ProtectedRoute] Auth validation error:", err);
        const errorMessage = err instanceof Error ? err.message : "Authentication required";
        
        if (mounted) {
          setAuthError(errorMessage);
          setIsAuthenticated(false);
          
          toast({
            title: "Authentication Required",
            description: errorMessage,
            variant: "destructive",
          });
        }

        // Delayed redirect to improve UX
        redirectTimeout = setTimeout(() => {
          if (mounted) {
            const currentPath = window.location.pathname;
            setLocation('/login', { 
              replace: true,
              state: { returnTo: currentPath }
            });
          }
        }, 2000);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    validateAuth();

    // Cleanup function
    return () => {
      mounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [user, error, setLocation, toast, getToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900">
        <div className="text-white/60 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900 p-4">
        <div className="w-full max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>{authError}</AlertDescription>
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={() => setLocation('/login')}
            >
              Go to Login
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
