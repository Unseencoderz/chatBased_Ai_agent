
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';

export async function getProjects(filters?: {
  status?: string;
  tech?: string;
  search?: string;
}) {
  let query = supabase
    .from('projects')
    .select('*, profiles:user_id(*)');
  
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
  
  if (data) {
    return data.map(project => ({
      ...project,
      user: project.profiles
    }));
  }
  
  return { data, error };
}

export async function getProject(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles:user_id(*), ratings(*)')
    .eq('id', id)
    .single();
  
  if (data) {
    // Calculate average rating
    const ratings = data.ratings || [];
    const avgRating = ratings.length 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;
    
    return {
      ...data,
      user: data.profiles,
      avg_rating: avgRating
    };
  }
  
  return { data, error };
}

export async function createProject(projectData: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      upload_date: new Date().toISOString(),
    })
    .select();
  
  return { data, error };
}

export async function getUserProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });
  
  return { data, error };
}
