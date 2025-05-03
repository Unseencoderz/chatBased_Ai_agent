
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';

export async function getProjects(filters?: {
  status?: string;
  tech?: string;
  search?: string;
}) {
  let query = supabase
    .from('projects')
    .select('*, profiles(*)');
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.tech) {
    query = query.contains('tech_stack', [filters.tech]);
  }
  
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  
  const { data, error } = await query.order('upload_date', { ascending: false });
  
  if (data && Array.isArray(data)) {
    return data.map(project => {
      // Ensure the data structure matches our Project type
      return {
        ...project,
        user: project.profiles,
        tech_stack: project.tech_stack || []
      } as unknown as Project;
    });
  }
  
  return { data, error };
}

export async function getProject(id: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(*), ratings(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching project:", error);
      return { data: null, error };
    }
    
    if (data) {
      // Calculate average rating
      let avgRating = 0;
      if (data.ratings && Array.isArray(data.ratings) && data.ratings.length > 0) {
        avgRating = data.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / data.ratings.length;
      }
      
      // Ensure the data structure matches our Project type
      const projectData = {
        ...data,
        user: data.profiles,
        avg_rating: avgRating,
        tech_stack: data.tech_stack || []
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
