
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';

export async function getProjects(filters?: {
  status?: string;
  tech?: string;
  search?: string;
}) {
  try {
    // First, get the projects
    let query = supabase
      .from('projects')
      .select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.tech) {
      query = query.contains('tech_stack', [filters.tech]);
    }
    
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    
    const { data: projectsData, error } = await query.order('upload_date', { ascending: false });
    
    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
    
    // If we have projects, fetch the user profiles separately
    if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
      const userIds = [...new Set(projectsData.map(project => project.user_id))];
      
      // Get all relevant user profiles in a single query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Map profiles to projects
      const projectsWithProfiles = projectsData.map(project => {
        const userProfile = profiles?.find(profile => profile.id === project.user_id) || null;
        
        return {
          ...project,
          user: userProfile,
          tech_stack: project.tech_stack || []
        } as unknown as Project;
      });
      
      return projectsWithProfiles;
    }
    
    return [];
  } catch (err) {
    console.error("Unexpected error in getProjects:", err);
    return [];
  }
}

export async function getProject(id: string) {
  try {
    // First get the project
    const { data: project, error } = await supabase
      .from('projects')
      .select('*, ratings(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching project:", error);
      return { data: null, error };
    }
    
    if (project) {
      // Get the user profile separately
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', project.user_id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }
      
      // Calculate average rating
      let avgRating = 0;
      if (project.ratings && Array.isArray(project.ratings) && project.ratings.length > 0) {
        avgRating = project.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / project.ratings.length;
      }
      
      // Ensure the data structure matches our Project type
      const projectData = {
        ...project,
        user: userProfile || null,
        avg_rating: avgRating,
        tech_stack: project.tech_stack || []
      } as unknown as Project;
      
      return { data: projectData, error: null };
    }
    
    return { data: null, error: null };
  } catch (err) {
    console.error("Unexpected error in getProject:", err);
    return { data: null, error: err as Error };
  }
}

export async function createProject(projectData: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      upload_date: new Date().toISOString(),
    } as any)
    .select();
  
  return { data, error };
}

export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });
  
  return { data: data as unknown as Project[], error };
}
