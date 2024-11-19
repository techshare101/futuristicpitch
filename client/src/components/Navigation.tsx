import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban, LogIn, LogOut, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useEffect, useState, useRef } from "react";

export function Navigation() {
  const { user, isLoading, logout, getToken } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();
  const unmountedRef = useRef(false);

  // Handle token validation on mount and path changes
  useEffect(() => {
    const validateCurrentPath = () => {
      const token = getToken();
      const currentPath = window.location.pathname;
      
      if (!token && currentPath !== '/login' && currentPath !== '/') {
        console.log("[Navigation] No valid token found on mount, redirecting to login");
        setLocation('/login');
      }
    };

    validateCurrentPath();

    return () => {
      unmountedRef.current = true;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [getToken, setLocation]);

  const handleLogout = async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      const token = getToken();
      if (!token) {
        console.log("[Navigation] No token found during logout");
        setLocation('/login');
        return;
      }

      const result = await logout();
      if (result.ok) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        setLocation('/login');
      } else {
        throw new Error(result.error || "Logout failed");
      }
    } catch (error) {
      console.error("[Navigation] Logout error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!unmountedRef.current) {
        setIsNavigating(false);
      }
    }
  };

  const handleNavigation = useCallback(async (path: string) => {
    if (isNavigating) return;

    try {
      setIsNavigating(true);
      const token = getToken();
      
      // Check if navigation requires authentication
      if (!token && path !== '/login' && path !== '/') {
        console.log("[Navigation] No valid token found, redirecting to login");
        toast({
          title: "Authentication Required",
          description: "Please log in to access this page",
          variant: "destructive",
        });
        
        // Store return path before redirecting
        sessionStorage.setItem('returnTo', path);
        setLocation('/login');
        return;
      }

      // Debounce navigation to prevent rapid redirects
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      navigationTimeoutRef.current = setTimeout(() => {
        if (!unmountedRef.current) {
          setLocation(path);
        }
      }, 50);

    } catch (error) {
      console.error("[Navigation] Navigation error:", error);
      toast({
        title: "Error",
        description: "Navigation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (!unmountedRef.current) {
        setIsNavigating(false);
      }
    }
  }, [getToken, setLocation, toast, isNavigating]);

  return (
    <nav className="fixed top-4 left-4 z-50 flex gap-2 items-center">
      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        onClick={() => handleNavigation('/')}
        disabled={isNavigating}
      >
        <Home className="w-5 h-5 mr-2" />
        Home
      </Button>
      
      {isLoading ? (
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10"
          disabled
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </Button>
      ) : user ? (
        <>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 
            shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
            relative overflow-hidden group"
            onClick={() => handleNavigation('/projects')}
            disabled={isNavigating}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <FolderKanban className="w-5 h-5 mr-2" />
            My Projects
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
            disabled={isNavigating}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20
          shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
          onClick={() => handleNavigation('/login')}
          disabled={isNavigating}
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login
        </Button>
      )}
    </nav>
  );
}
