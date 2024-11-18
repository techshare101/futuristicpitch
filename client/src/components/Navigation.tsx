import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban, LogIn, LogOut, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

export function Navigation() {
  const { user, isLoading, logout } = useUser();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-4 left-4 z-50 flex gap-2 items-center">
      <Link href="/">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        >
          <Home className="w-5 h-5 mr-2" />
          Home
        </Button>
      </Link>
      
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
          <Link href="/projects">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 
              shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
              relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FolderKanban className="w-5 h-5 mr-2" />
              My Projects
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20
            shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </Button>
        </Link>
      )}
    </nav>
  );
}
