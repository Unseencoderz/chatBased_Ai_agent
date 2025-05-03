
export type TechStack = 
  | "react"
  | "vue"
  | "angular"
  | "svelte"
  | "next"
  | "node"
  | "express"
  | "nest"
  | "django"
  | "flask"
  | "laravel"
  | "spring"
  | "firebase"
  | "supabase"
  | "mongodb"
  | "postgres"
  | "mysql"
  | "graphql"
  | "apollo"
  | "tailwind"
  | "bootstrap"
  | "mui"
  | "aws"
  | "gcp"
  | "azure"
  | "docker"
  | "kubernetes";

export type ProjectStatus = "ongoing" | "finished" | "stopped";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  status: ProjectStatus;
  upload_date: string;
  project_url?: string;
  github_url?: string;
  tech_stack: TechStack[];
  user_id: string;
  user: User;
  avg_rating?: number;
  ratings?: Rating[]; // Add this line to fix the TypeScript error
}

export interface Rating {
  id: string;
  project_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}
