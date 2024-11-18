import { useEffect, useState, useRef, useCallback } from "react";
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
  const redirectInProgress = useRef(false);
  const authCheckInProgress = useRef(false);
  const unmounted = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { user, error, getToken, refreshToken } = useUser();

  // Handle redirect with debouncing and tracking
  const handleRedirect = useCallback((path: string, state?: any) => {
    if (redirectInProgress.current || unmounted.current) {
      console.log("[ProtectedRoute] Redirect already in progress or component unmounted, skipping");
      return;
    }

    redirectInProgress.current = true;
    console.log("[ProtectedRoute] Initiating redirect to:", path);
    
    // Clear any existing redirect timeout
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
    }

    // Set a new redirect timeout
    redirectTimeout.current = setTimeout(() => {
      if (!unmounted.current) {
        setLocation(path, state);
        
        // Reset redirect flag after navigation
        setTimeout(() => {
          redirectInProgress.current = false;
        }, 1000);
      }
    }, 100);
  }, [setLocation]);

  // Authentication check with retry mechanism
  const checkAuthentication = useCallback(async () => {
    if (authCheckInProgress.current || unmounted.current) {
      return;
    }

    authCheckInProgress.current = true;
    
    try {
      const token = getToken();
      console.log("[ProtectedRoute] Validating authentication");
      
      if (!token) {
        throw new Error("Please log in to continue");
      }

      if (user) {
        console.log("[ProtectedRoute] User authenticated:", user.id);
        setIsAuthenticated(true);
        setAuthError(null);

        // Check if token needs refresh
        await refreshToken();
      } else if (error) {
        console.error("[ProtectedRoute] Auth error:", error);
        throw error;
      }
    } catch (err) {
      if (unmounted.current) return;

      const errorMessage = err instanceof Error ? err.message : "Authentication required";
      console.error("[ProtectedRoute] Auth validation error:", { message: errorMessage });
      
      setAuthError(errorMessage);
      setIsAuthenticated(false);
      
      toast({
        title: "Authentication Required",
        description: errorMessage,
        variant: "destructive",
      });

      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        handleRedirect('/login', { 
          replace: true,
          state: { returnTo: currentPath }
        });
      }
    } finally {
      if (!unmounted.current) {
        setIsLoading(false);
        authCheckInProgress.current = false;
      }
    }
  }, [user, error, getToken, refreshToken, handleRedirect, toast]);

  useEffect(() => {
    unmounted.current = false;
    console.log("[ProtectedRoute] Component mounted");

    checkAuthentication();

    return () => {
      unmounted.current = true;
      console.log("[ProtectedRoute] Component unmounted");
      
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
    };
  }, [checkAuthentication]);

  // Effect to handle authentication state changes
  useEffect(() => {
    if (!isLoading && !unmounted.current) {
      checkAuthentication();
    }
  }, [user, error, checkAuthentication, isLoading]);

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
              onClick={() => handleRedirect('/login')}
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
