
import { Link } from "react-router-dom";
import { Project } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import TechBadge from "./TechBadge";
import { format } from "date-fns";

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

interface ProjectCardProps {
  project: Project;
  isAuthenticated?: boolean;
}

const ProjectCard = ({ project, isAuthenticated = false }: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-white/20 bg-black/20 backdrop-blur-sm border-white/10">
      <div className="relative h-48 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <Badge className={`${statusColors[project.status]}`}>
            {statusNames[project.status]}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{project.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {project.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {project.tech_stack.slice(0, 3).map((tech) => (
            <TechBadge key={tech} tech={tech} />
          ))}
          {project.tech_stack.length > 3 && (
            <Badge variant="secondary" className="text-xs px-2">
              +{project.tech_stack.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground">
            {format(new Date(project.upload_date), "MMM d, yyyy")}
          </span>
        </div>
        
        {project.avg_rating !== undefined && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs">{project.avg_rating.toFixed(1)}</span>
          </div>
        )}
        
        <Link
          to={isAuthenticated ? `/project/${project.id}` : "/login"}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          {isAuthenticated ? "View Details" : "Login to View"}
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
