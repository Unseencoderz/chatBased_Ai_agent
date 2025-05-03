
import { cn } from "@/lib/utils";
import { TechStack } from "@/types";
import { 
  Database, 
  Globe, 
  Monitor, 
  Server, 
  Cloud, 
  Code,
  BoxIcon
} from "lucide-react";

interface TechBadgeProps {
  tech: TechStack;
  className?: string;
}

const techIcons: Record<TechStack, any> = {
  react: { icon: Monitor, color: "text-blue-400" },
  vue: { icon: Monitor, color: "text-green-400" },
  angular: { icon: Monitor, color: "text-red-400" },
  svelte: { icon: Monitor, color: "text-orange-400" },
  next: { icon: Monitor, color: "text-gray-400" },
  node: { icon: Server, color: "text-green-500" },
  express: { icon: Server, color: "text-gray-400" },
  nest: { icon: Server, color: "text-red-400" },
  django: { icon: Server, color: "text-green-600" },
  flask: { icon: Server, color: "text-gray-400" },
  laravel: { icon: Server, color: "text-red-500" },
  spring: { icon: Server, color: "text-green-400" },
  firebase: { icon: Cloud, color: "text-yellow-500" },
  supabase: { icon: Database, color: "text-green-400" },
  mongodb: { icon: Database, color: "text-green-500" },
  postgres: { icon: Database, color: "text-blue-400" },
  mysql: { icon: Database, color: "text-blue-500" },
  graphql: { icon: Database, color: "text-pink-500" },
  apollo: { icon: Globe, color: "text-purple-400" },
  tailwind: { icon: Code, color: "text-blue-400" },
  bootstrap: { icon: Code, color: "text-purple-500" },
  mui: { icon: Code, color: "text-blue-400" },
  aws: { icon: Cloud, color: "text-yellow-500" },
  gcp: { icon: Cloud, color: "text-red-400" },
  azure: { icon: Cloud, color: "text-blue-500" },
  docker: { icon: BoxIcon, color: "text-blue-400" },
  kubernetes: { icon: BoxIcon, color: "text-blue-500" },
};

const techNames: Record<TechStack, string> = {
  react: "React",
  vue: "Vue.js",
  angular: "Angular",
  svelte: "Svelte",
  next: "Next.js",
  node: "Node.js",
  express: "Express",
  nest: "NestJS",
  django: "Django",
  flask: "Flask",
  laravel: "Laravel",
  spring: "Spring",
  firebase: "Firebase",
  supabase: "Supabase",
  mongodb: "MongoDB",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  graphql: "GraphQL",
  apollo: "Apollo",
  tailwind: "Tailwind CSS",
  bootstrap: "Bootstrap",
  mui: "Material UI",
  aws: "AWS",
  gcp: "Google Cloud",
  azure: "Azure",
  docker: "Docker",
  kubernetes: "Kubernetes",
};

const TechBadge = ({ tech, className }: TechBadgeProps) => {
  const techInfo = techIcons[tech];
  const TechIcon = techInfo.icon;
  const displayName = techNames[tech];
  
  return (
    <div className={cn("tech-badge", className)}>
      <TechIcon className={cn("h-3 w-3", techInfo.color)} />
      <span>{displayName}</span>
    </div>
  );
};

export default TechBadge;
