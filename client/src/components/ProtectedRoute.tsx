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
  const unmountedRef = useRef(false);
  const authTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { user, error, getToken } = useUser();

  // Updated handleRedirect with simplified logic
  const handleRedirect = useCallback((path: string) => {
    if (redirectInProgress.current || unmountedRef.current) return;
    redirectInProgress.current = true;
    setLocation(path);
    setTimeout(() => {
      redirectInProgress.current = false;
    }, 100);
  }, [setLocation]);

  const checkAuthentication = useCallback(async () => {
    if (authCheckInProgress.current || unmountedRef.current) return;

    authCheckInProgress.current = true;
    setIsLoading(true);
    
    try {
      const token = getToken();
      console.log("[ProtectedRoute] Checking authentication");
      
      if (!token) {
        throw new Error("Authentication required");
      }

      if (user) {
        console.log("[ProtectedRoute] User authenticated:", user.id);
        setIsAuthenticated(true);
        setAuthError(null);

        // Handle post-login redirect
        const returnTo = sessionStorage.getItem('returnTo');
        if (returnTo && window.location.pathname === '/login') {
          sessionStorage.removeItem('returnTo');
          handleRedirect(returnTo);
        }
      } else if (error) {
        throw error;
      }
    } catch (err) {
      if (unmountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : "Authentication required";
      console.error("[ProtectedRoute] Authentication failed:", errorMessage);
      
      setIsAuthenticated(false);
      setAuthError(errorMessage);
      
      toast({
        title: "Authentication Required",
        description: errorMessage,
        variant: "destructive",
      });

      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        sessionStorage.setItem('returnTo', currentPath);
        handleRedirect('/login');
      }
    } finally {
      if (!unmountedRef.current) {
        setIsLoading(false);
        authCheckInProgress.current = false;
      }
    }
  }, [user, error, getToken, handleRedirect, toast]);

  useEffect(() => {
    unmountedRef.current = false;
    console.log("[ProtectedRoute] Component mounted");

    const performInitialCheck = async () => {
      try {
        await checkAuthentication();
      } catch (error) {
        if (!unmountedRef.current) {
          console.error("[ProtectedRoute] Initial auth check failed:", error);
          authTimeoutRef.current = setTimeout(performInitialCheck, 2000);
        }
      }
    };

    performInitialCheck();

    return () => {
      unmountedRef.current = true;
      redirectInProgress.current = false;
      authCheckInProgress.current = false;
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      console.log("[ProtectedRoute] Component cleanup completed");
    };
  }, [checkAuthentication]);

  useEffect(() => {
    if (!isLoading && !unmountedRef.current) {
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
              onClick={() => handleRedirect('/login')}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white"
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