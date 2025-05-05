
import { supabase } from '@/integrations/supabase/client';

export async function initializeApp() {
  try {
    // Check if avatars bucket exists to confirm app is initialized
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    // Check if handle_new_user function exists
    const { data: functions, error: functionError } = await supabase
      .from('pg_catalog.pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user')
      .maybeSingle();
    
    if (functionError) {
      console.error('Error checking for handle_new_user function:', functionError);
    }
    
    if (avatarsBucketExists && functions) {
      console.log('App initialized successfully');
    } else {
      console.log('Initialization issue:', 
        !avatarsBucketExists ? 'Avatars bucket not found.' : '',
        !functions ? 'handle_new_user function not found.' : ''
      );
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}
