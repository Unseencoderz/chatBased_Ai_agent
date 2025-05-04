
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProjects, getCurrentUser } from "@/lib/supabase";
import { Project, User } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Projects = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    
    loadUser();
  }, []);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const filters = searchQuery ? { search: searchQuery } : undefined;
        const projectsData = await getProjects(filters);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ search: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Projects</h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing projects from the developer community
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchQuery && (
              <Button type="button" variant="ghost" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </form>
        </div>
        
        {searchQuery && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              Showing results for "{searchQuery}"
            </p>
          </div>
        )}

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
              {searchQuery 
                ? "Try a different search term or clear your filters."
                : "Be the first to upload a project to our community!"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
