import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, FolderKanban } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function Navigation() {
  const { user } = useUser();

  return (
    <div className="fixed top-4 left-4 z-50 flex gap-2">
      <Link href="/">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        >
          <Home className="w-5 h-5 mr-2" />
          Home
        </Button>
      </Link>
      
      {user && (
        <Link href="/projects">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
          >
            <FolderKanban className="w-5 h-5 mr-2" />
            My Projects
          </Button>
        </Link>
      )}
    </div>
  );
}
