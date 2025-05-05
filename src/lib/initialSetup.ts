
import { supabase } from '@/integrations/supabase/client';

export async function initializeApp() {
  try {
    // Check if avatars bucket exists to confirm app is initialized
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    // Check if handle_new_user function exists by executing our function_exists RPC
    // We'll use the generic approach without explicit type parameters to avoid type errors
    const { data: functionExists, error: functionError } = await supabase.rpc(
      'function_exists',
      { function_name: 'handle_new_user' } 
    );
    
    if (functionError) {
      console.error('Error checking for handle_new_user function:', functionError);
      // If we can't check if the function exists, assume it doesn't for safety
      console.log('Initialization issue:', 
        !avatarsBucketExists ? 'Avatars bucket not found.' : '',
        'Could not verify if handle_new_user function exists.'
      );
      return;
    }
    
    if (avatarsBucketExists && functionExists) {
      console.log('App initialized successfully');
    } else {
      console.log('Initialization issue:', 
        !avatarsBucketExists ? 'Avatars bucket not found.' : '',
        !functionExists ? 'handle_new_user function not found.' : ''
      );
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}
