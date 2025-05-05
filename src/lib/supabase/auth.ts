
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

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

  // We no longer need to manually create a profile record
  // The database trigger will handle this automatically
  
  return { data: authData, error: authError };
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
  
  if (data) {
    // Cast the data to match our User type
    const userData = {
      id: data.id,
      email: data.email || '',
      username: data.username || data.name || '',
      name: data.name || '',
      avatar_url: data.avatar_url,
      bio: data.bio,
      created_at: data.created_at
    } as User;
    
    return userData;
  }
  
  return null;
}
