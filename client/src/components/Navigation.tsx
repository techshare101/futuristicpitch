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

  const handleNavigation = useCallback(async (path: string) => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      const token = getToken();
      
      if (!token && path !== '/login' && path !== '/') {
        sessionStorage.setItem('returnTo', path);
        setLocation('/login');
        return;
      }
      
      setLocation(path);
    } catch (error) {
      console.error("[Navigation] Navigation error:", error);
      toast({
        title: "Error",
        description: "Navigation failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNavigating(false);
    }
  }, [getToken, setLocation, toast, isNavigating]);

  const handleLogout = async () => {
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
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
        description: error instanceof Error ? error.message : "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setIsNavigating(false);
    }
  };

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