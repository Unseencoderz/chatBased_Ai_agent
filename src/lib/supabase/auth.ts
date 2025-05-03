
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
