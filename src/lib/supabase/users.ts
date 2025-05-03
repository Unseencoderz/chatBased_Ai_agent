
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  return { data, error };
}

export async function getUserProfile(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
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
    
    return { data: userData, error };
  }
  
  return { data, error };
}
