
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/lib/supabase";
import { Project, TechStack } from "@/types";
import TechBadge from "@/components/TechBadge";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";

interface TechCount {
  tech: TechStack;
  count: number;
}

const TechGallery = () => {
  const [techCounts, setTechCounts] = useState<TechCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadData() {
      try {
        const projectsData = await getProjects();
        
        if (Array.isArray(projectsData)) {
          // Count occurrences of each technology across all projects
          const counts: Record<string, number> = {};
          
          projectsData.forEach((project: Project) => {
            project.tech_stack.forEach((tech) => {
              counts[tech] = (counts[tech] || 0) + 1;
            });
          });
          
          // Convert to array and sort by count (descending)
          const techCountArray = Object.entries(counts).map(([tech, count]) => ({
            tech: tech as TechStack,
            count,
          }));
          
          techCountArray.sort((a, b) => b.count - a.count);
          
          setTechCounts(techCountArray);
        }
      } catch (error) {
        console.error("Error loading tech data:", error);
        toast({
          title: "Error loading technology data",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [toast]);
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Tech Gallery</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore the technologies used by developers in their projects. Click on any tech to see projects that use it.
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-md animate-pulse bg-muted/20"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {techCounts.map(({ tech, count }) => (
              <Link
                key={tech}
                to={`/?tech=${tech}`}
                className="block transition-all duration-300"
              >
                <Card className="h-full border-white/10 hover:border-white/20 bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-all">
                  <CardContent className="flex flex-col items-center justify-center h-full p-4">
                    <div className="flex items-center justify-center h-12 mb-2">
                      <TechBadge tech={tech} className="scale-125" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Used in {count} project{count !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TechGallery;
