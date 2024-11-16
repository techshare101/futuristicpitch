import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export function Navigation() {
  return (
    <Link href="/">
      <Button 
        variant="ghost" 
        className="fixed top-4 left-4 z-50 text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
      >
        <Home className="w-5 h-5 mr-2" />
        Home
      </Button>
    </Link>
  );
}
