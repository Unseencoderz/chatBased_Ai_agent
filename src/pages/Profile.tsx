
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, FileEdit } from "lucide-react";
import { getCurrentUser, getUserProfile, getUserProjects } from "@/lib/supabase";
import { Project, User } from "@/types";
import ProfileCard from "@/components/ProfileCard";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      if (!username) return;
      
      try {
        // Load current user
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        
        // Load profile user
        const { data: profileData, error: profileError } = await getUserProfile(username);
        
        if (profileError || !profileData) {
          toast({
            title: "Error loading profile",
            description: "User not found or profile is private.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        setProfile(profileData as User);
        
        // Load user's projects
        const { data: projectsData } = await getUserProjects(profileData.id);
        
        if (projectsData) {
          setProjects(projectsData as Project[]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [username, toast]);
  
  // Calculate average rating across all projects
  const calculateAvgRating = () => {
    if (projects.length === 0) return undefined;
    
    const projectsWithRatings = projects.filter((project) => project.avg_rating !== undefined);
    if (projectsWithRatings.length === 0) return undefined;
    
    const sum = projectsWithRatings.reduce((acc, project) => acc + (project.avg_rating || 0), 0);
    return sum / projectsWithRatings.length;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/20 rounded-lg"></div>
            <div className="h-8 w-1/3 bg-muted/20 rounded"></div>
            <div className="h-32 bg-muted/20 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The user you're looking for doesn't exist or has a private profile.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
      </div>
    );
  }
  
  const isCurrentUserProfile = currentUser?.id === profile.id;
  const avgRating = calculateAvgRating();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex flex-col">
              <ProfileCard
                user={profile}
                projectCount={projects.length}
                avgRating={avgRating}
                isCurrentUser={isCurrentUserProfile}
              />
              
              {isCurrentUserProfile && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  asChild
                >
                  <Link to={`/profile/edit/${profile.username}`} className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
          
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Projects</h2>
              
              {isCurrentUserProfile && (
                <Button asChild>
                  <Link to="/upload" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Upload Project</span>
                  </Link>
                </Button>
              )}
            </div>
            
            {projects.length === 0 ? (
              <div className="text-center py-12 border border-white/10 rounded-lg bg-black/20">
                <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  {isCurrentUserProfile
                    ? "Share your work with the developer community!"
                    : "This user hasn't uploaded any projects yet."}
                </p>
                
                {isCurrentUserProfile && (
                  <Button asChild>
                    <Link to="/upload">Upload Your First Project</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isAuthenticated={!!currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
