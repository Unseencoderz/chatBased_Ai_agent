
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { User } from "@/types";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { Github, LogOut, Plus, User as UserIcon } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (!error) {
      setUser(null);
      toast({
        title: "Signed out successfully",
        duration: 3000,
      });
    } else {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Github className="h-6 w-6" />
            <span className="text-lg font-bold">DevStream</span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link to="/tech-gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Tech Gallery
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/upload" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Upload</span>
                  </Link>
                </Button>
                
                <Button asChild variant="secondary" size="sm">
                  <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.name || user.username}</span>
                  </Link>
                </Button>
                
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link to="/login?signup=true">Sign Up</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
