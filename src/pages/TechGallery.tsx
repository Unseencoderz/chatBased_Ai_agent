import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProjects, getCurrentUser } from "@/lib/supabase";
import { Project, TechStack, User } from "@/types";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ProjectCard";
import TechBadge from "@/components/TechBadge";
import Navbar from "@/components/Navbar";
import TechDropdown from "@/components/TechDropdown";

const techOptions: TechStack[] = [
  "react",
  "vue",
  "angular",
  "svelte",
  "next",
  "node",
  "express",
  "nest",
  "django",
  "flask",
  "laravel",
  "spring",
  "firebase",
  "supabase",
  "mongodb",
  "postgres",
  "mysql",
  "graphql",
  "apollo",
  "tailwind",
  "bootstrap",
  "mui",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
];

const TechGallery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedTech = searchParams.get("tech") as TechStack | null;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, []);
  
  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      
      try {
        const projectsData = await getProjects({ tech: selectedTech || undefined });
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProjects();
  }, [selectedTech]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-4">Tech Gallery</h1>
        <p className="text-muted-foreground mb-6">
          Explore projects by technology stack
        </p>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-3">Popular Technologies</h2>
          <TechDropdown 
            techList={techOptions}
            onSelectTech={(tech) => navigate(`/?tech=${tech}`)}
          />
        </div>
        
        {selectedTech && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">
                Projects using <TechBadge tech={selectedTech} />
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/tech-gallery`)}
              >
                Clear Filter
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-white/10 rounded-lg p-4 h-[300px]">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted/20 rounded w-3/4"></div>
                      <div className="h-32 bg-muted/20 rounded"></div>
                      <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                      <div className="h-4 bg-muted/20 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    isAuthenticated={!!currentUser} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-white/10 rounded-lg bg-black/20">
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to upload a project using this technology!
                </p>
                {currentUser ? (
                  <Button asChild>
                    <Link to="/upload">Upload a Project</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/login">Sign in to upload</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TechGallery;
