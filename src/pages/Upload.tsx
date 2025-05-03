
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/supabase";
import { User, Project } from "@/types";
import ProjectForm from "@/components/ProjectForm";
import Navbar from "@/components/Navbar";

const Upload = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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
  
  const handleSuccess = (project: Project) => {
    // Navigate to the newly created project
    navigate(`/project/${project.id}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-1/3 bg-muted/20 rounded"></div>
              <div className="h-4 w-2/3 bg-muted/20 rounded"></div>
              <div className="h-64 bg-muted/20 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user && !loading) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Submit Your Project</h1>
          <p className="text-muted-foreground mb-8">
            Share your work with the developer community
          </p>
          
          {user && (
            <div className="border border-white/10 rounded-lg p-6 bg-black/20 backdrop-blur-sm">
              <ProjectForm userId={user.id} onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Upload;
