
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { User } from "@/types";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { Github, LogOut, Plus, User as UserIcon, Settings, Image, FileEdit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.name || user.username} />
                        <AvatarFallback className="bg-primary/10">
                          {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user.username}`} className="flex w-full cursor-pointer items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/upload" className="flex w-full cursor-pointer items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Upload Project</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/edit/${user.username}`} className="flex w-full cursor-pointer items-center">
                        <FileEdit className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
