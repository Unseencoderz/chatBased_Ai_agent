
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Github, 
  Star,
  Upload, 
  User 
} from "lucide-react";
import { format } from "date-fns";
import { getCurrentUser, getProject, rateProject } from "@/lib/supabase";
import { Project, User as UserType } from "@/types";
import TechBadge from "@/components/TechBadge";
import Navbar from "@/components/Navbar";

const statusColors = {
  ongoing: "bg-status-ongoing",
  finished: "bg-status-finished",
  stopped: "bg-status-stopped",
};

const statusNames = {
  ongoing: "Ongoing",
  finished: "Finished",
  stopped: "Stopped",
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        const projectData = await getProject(id);
        
        if (projectData && !projectData.error) {
          setProject(projectData);
          
          // Check if user has rated this project before
          if (userData && projectData.ratings) {
            const userRatingObj = projectData.ratings.find(
              (r: any) => r.user_id === userData.id
            );
            if (userRatingObj) {
              setUserRating(userRatingObj.rating);
            }
          }
        } else {
          toast({
            title: "Error loading project",
            description: "Project not found or you don't have permission to view it.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [id, toast]);

  const handleRating = async (rating: number) => {
    if (!project || !user) return;
    
    setSubmittingRating(true);
    
    try {
      await rateProject(project.id, user.id, rating);
      
      setUserRating(rating);
      
      // Update local project data with new rating
      setProject({
        ...project,
        avg_rating: project.avg_rating 
          ? (project.avg_rating * (project.ratings?.length || 1) + rating) / (project.ratings?.length || 1) 
          : rating,
      });
      
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this project!",
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Failed to submit rating",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 bg-muted/20 rounded"></div>
            <div className="h-64 bg-muted/20 rounded"></div>
            <div className="h-4 w-full bg-muted/20 rounded"></div>
            <div className="h-4 w-2/3 bg-muted/20 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The project you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">{project.title}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge className={`${statusColors[project.status]}`}>
                  {statusNames[project.status]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                {project.user && (
                  <Link
                    to={`/profile/${project.user.username}`}
                    className="flex items-center gap-1.5 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span>{project.user.name || project.user.username}</span>
                  </Link>
                )}
                
                <div className="flex items-center gap-1.5">
                  <Upload className="h-4 w-4" />
                  <span>
                    {format(new Date(project.upload_date), "MMM d, yyyy")}
                  </span>
                </div>
                
                {project.avg_rating !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{project.avg_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative rounded-lg overflow-hidden mb-8 aspect-video bg-muted">
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">About the Project</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {project.description}
              </p>
            </div>
            
            <Separator className="mb-8" />
            
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Rate this Project</h2>
              
              {user ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="ghost"
                      size="icon"
                      disabled={submittingRating}
                      onClick={() => handleRating(star)}
                      className={userRating >= star ? "text-yellow-500" : "text-muted-foreground"}
                    >
                      <Star className={userRating >= star ? "fill-yellow-500" : ""} />
                    </Button>
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {userRating ? `Your rating: ${userRating}/5` : "Click to rate"}
                  </span>
                </div>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/login">Login to Rate</Link>
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <div className="border border-white/10 rounded-lg p-6 bg-black/20 backdrop-blur-sm mb-6">
              <h3 className="text-lg font-medium mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {project.start_date
                        ? format(new Date(project.start_date), "MMM yyyy")
                        : "Not specified"}
                      {project.end_date
                        ? ` - ${format(new Date(project.end_date), "MMM yyyy")}`
                        : " - Present"}
                    </span>
                  </div>
                </div>
                
                {project.project_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Live Project
                    </p>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Live</span>
                      </a>
                    </Button>
                  </div>
                )}
                
                {project.github_url && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Source Code
                    </p>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border border-white/10 rounded-lg p-6 bg-black/20 backdrop-blur-sm">
              <h3 className="text-lg font-medium mb-4">Tech Stack</h3>
              
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech) => (
                  <TechBadge key={tech} tech={tech} className="animate-fade-in" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
