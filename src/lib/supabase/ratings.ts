
import { supabase } from '@/integrations/supabase/client';

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
