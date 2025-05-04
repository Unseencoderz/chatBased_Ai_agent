
import { supabase } from '@/integrations/supabase/client';

export async function initializeApp() {
  try {
    // Check if avatars bucket exists to confirm app is initialized
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (avatarsBucketExists) {
      console.log('App initialized successfully');
    } else {
      console.log('Initialization issue: Avatars bucket not found');
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}
