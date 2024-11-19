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
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const redirectInProgress = useRef(false);
  const authCheckInProgress = useRef(false);
  const unmountedRef = useRef(false);
  const authTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const { user, error, getToken } = useUser();

  // Enhanced redirect handling with attempt counting
  const handleRedirect = useCallback((path: string) => {
    if (redirectInProgress.current || unmountedRef.current) {
      console.log("[ProtectedRoute] Redirect blocked - already in progress or unmounted");
      return;
    }

    if (redirectAttempts >= 3) {
      console.log("[ProtectedRoute] Maximum redirect attempts reached");
      toast({
        title: "Navigation Error",
        description: "Too many redirect attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    redirectInProgress.current = true;
    console.log("[ProtectedRoute] Starting redirect to:", path);

    // Store current path for post-login redirect
    if (path === '/login') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        console.log("[ProtectedRoute] Storing return path:", currentPath);
        sessionStorage.setItem('returnTo', currentPath);
      }
    }

    // Increment redirect attempts
    setRedirectAttempts(prev => prev + 1);

    // Debounce redirect to prevent rapid consecutive redirects
    debounceTimeoutRef.current = setTimeout(() => {
      if (!unmountedRef.current) {
        setLocation(path);
        // Reset redirect flag after navigation
        setTimeout(() => {
          if (!unmountedRef.current) {
            redirectInProgress.current = false;
            console.log("[ProtectedRoute] Redirect completed, flag reset");
          }
        }, 100);
      }
    }, 50);
  }, [setLocation, redirectAttempts, toast]);

  // Enhanced authentication check with proper error handling
  const checkAuthentication = useCallback(async () => {
    if (authCheckInProgress.current || unmountedRef.current) {
      console.log("[ProtectedRoute] Auth check blocked - already in progress or unmounted");
      return;
    }

    authCheckInProgress.current = true;
    if (!isLoading) setIsLoading(true);
    
    try {
      const token = getToken();
      console.log("[ProtectedRoute] Checking authentication status");
      
      if (!token) {
        throw new Error("No valid authentication token found");
      }

      if (user) {
        console.log("[ProtectedRoute] User authenticated:", user.id);
        setIsAuthenticated(true);
        setAuthError(null);
        setRedirectAttempts(0); // Reset attempts on successful auth

        // Handle post-login redirect
        const returnTo = sessionStorage.getItem('returnTo');
        if (returnTo && window.location.pathname === '/login') {
          console.log("[ProtectedRoute] Redirecting to stored path:", returnTo);
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
      
      // Only show toast and redirect if we haven't exceeded attempts
      if (redirectAttempts < 3) {
        toast({
          title: "Authentication Required",
          description: errorMessage,
          variant: "destructive",
        });

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/') {
          handleRedirect('/login');
        }
      }
    } finally {
      if (!unmountedRef.current) {
        setIsLoading(false);
        authCheckInProgress.current = false;
      }
    }
  }, [user, error, getToken, handleRedirect, toast, isLoading, redirectAttempts]);

  // Component lifecycle management with cleanup
  useEffect(() => {
    unmountedRef.current = false;
    setRedirectAttempts(0); // Reset attempts on mount
    console.log("[ProtectedRoute] Component mounted");

    const performInitialCheck = async () => {
      try {
        await checkAuthentication();
      } catch (error) {
        if (!unmountedRef.current) {
          console.error("[ProtectedRoute] Initial auth check failed:", error);
          if (redirectAttempts < 3) {
            authTimeoutRef.current = setTimeout(performInitialCheck, 2000);
          }
        }
      }
    };

    performInitialCheck();

    return () => {
      unmountedRef.current = true;
      redirectInProgress.current = false;
      authCheckInProgress.current = false;
      setRedirectAttempts(0); // Reset attempts on unmount
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      console.log("[ProtectedRoute] Component cleanup completed");
    };
  }, [checkAuthentication, redirectAttempts]);

  // Auth state changes handler with debounce
  useEffect(() => {
    if (!isLoading && !unmountedRef.current) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (redirectAttempts < 3) {
          checkAuthentication();
        }
      }, 100);
    }
  }, [user, error, checkAuthentication, isLoading, redirectAttempts]);

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
              onClick={() => {
                if (redirectAttempts < 3) {
                  handleRedirect('/login');
                }
              }}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white"
              disabled={redirectAttempts >= 3}
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
