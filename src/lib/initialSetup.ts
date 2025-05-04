
import { supabase } from '@/integrations/supabase/client';
import { createBucket } from '@/lib/supabase/storage';

export async function initializeApp() {
  try {
    // Check if avatars bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucketExists) {
      await createBucket('avatars', true);
      console.log('Created avatars bucket');
    }
  } catch (error) {
    console.error('Error during app initialization:', error);
  }
}
