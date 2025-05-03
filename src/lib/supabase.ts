import { createClient } from '@supabase/supabase-js';
import { type User, type Project, type Rating } from '@/types';

// These are placeholder values - in production you'd use environment variables
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string, username: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (authError) return { data: null, error: authError };

  // Create a profile record in the profiles table
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        email,
        name: username,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return { data: null, error: profileError };
    }
  }

  return { data: authData, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function getCurrentUser() {
  const { data: sessionData } = await getSession();
  
  if (!sessionData.session?.user) {
    return null;
  }
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', sessionData.session.user.id)
    .single();
  
  return data as User | null;
}

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
      ? ratings.reduce((sum: number, r: Rating) => sum + r.rating, 0) / ratings.length
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

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
}

export async function getUserProfile(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
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

export async function rateProject(projectId: string, userId: string, rating: number) {
  // Check if user has already rated
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (existingRating) {
    // Update existing rating
    const { data, error } = await supabase
      .from('ratings')
      .update({ rating })
      .eq('id', existingRating.id)
      .select();
    
    return { data, error };
  } else {
    // Create new rating
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        project_id: projectId,
        user_id: userId,
        rating,
        created_at: new Date().toISOString(),
      })
      .select();
    
    return { data, error };
  }
}
