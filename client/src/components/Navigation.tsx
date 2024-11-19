import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban, Wand } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-4 left-4 z-50 flex gap-2 items-center">
      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        onClick={() => window.location.href = '/'}
      >
        <Home className="w-5 h-5 mr-2" />
        Home
      </Button>
      
      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 
        shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
        relative overflow-hidden group"
        onClick={() => window.location.href = '/projects'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <FolderKanban className="w-5 h-5 mr-2" />
        Projects
      </Button>

      <Button 
        variant="ghost" 
        className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        onClick={() => window.location.href = '/generator'}
      >
        <Wand className="w-5 h-5 mr-2" />
        Generator
      </Button>
    </nav>
  );
}
