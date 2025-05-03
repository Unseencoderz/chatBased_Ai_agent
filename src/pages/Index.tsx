
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getProjects } from "@/lib/supabase";
import { Project, TechStack, User } from "@/types";
import ProjectCard from "@/components/ProjectCard";
import TechBadge from "@/components/TechBadge";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    tech: "",
    search: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        const projectsData = await getProjects();
        
        if (Array.isArray(projectsData)) {
          setProjects(projectsData);
        } else {
          console.error("Unexpected project data format", projectsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading projects",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [toast]);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const projectsData = await getProjects(filters);
      
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("Error filtering projects:", error);
      toast({
        title: "Error filtering projects",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setFilters({ status: "", tech: "", search: "" });
    setLoading(true);
    
    try {
      const projectsData = await getProjects();
      
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("Error clearing filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const topTechnologies: TechStack[] = ["react", "node", "supabase", "postgres", "tailwind"];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Discover Amazing Developer Projects</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse through a collection of innovative projects built by developers around the world.
            Share your work and get inspired!
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
            <Button onClick={handleFilter}>Search</Button>
          </div>
        </section>
        
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Popular Tech:</span>
            {topTechnologies.map((tech) => (
              <Button
                key={tech}
                variant={filters.tech === tech ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => {
                  setFilters({
                    ...filters,
                    tech: filters.tech === tech ? "" : tech,
                  });
                  handleFilter();
                }}
              >
                <TechBadge tech={tech} />
              </Button>
            ))}
            
            <div className="ml-auto flex gap-2">
              <Button
                variant={filters.status === "ongoing" ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => {
                  setFilters({
                    ...filters,
                    status: filters.status === "ongoing" ? "" : "ongoing",
                  });
                  handleFilter();
                }}
              >
                <span className="w-2 h-2 rounded-full bg-status-ongoing mr-1.5"></span>
                Ongoing
              </Button>
              <Button
                variant={filters.status === "finished" ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => {
                  setFilters({
                    ...filters,
                    status: filters.status === "finished" ? "" : "finished",
                  });
                  handleFilter();
                }}
              >
                <span className="w-2 h-2 rounded-full bg-status-finished mr-1.5"></span>
                Finished
              </Button>
              <Button
                variant={filters.status === "stopped" ? "default" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => {
                  setFilters({
                    ...filters,
                    status: filters.status === "stopped" ? "" : "stopped",
                  });
                  handleFilter();
                }}
              >
                <span className="w-2 h-2 rounded-full bg-status-stopped mr-1.5"></span>
                Stopped
              </Button>
            </div>
          </div>
          
          {(filters.status || filters.tech || filters.search) && (
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Showing filtered results
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] rounded-md animate-pulse bg-muted/20"
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
