
import { supabase } from '@/integrations/supabase/client';

export async function createBucket(bucketName: string, isPublic: boolean = true) {
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: isPublic,
  });
  
  return { data, error };
}

export async function uploadFile(
  bucketName: string,
  filePath: string, 
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file);
  
  return { data, error };
}

export async function getPublicUrl(bucketName: string, filePath: string) {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

export async function deleteFile(bucketName: string, filePath: string) {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);
  
  return { error };
}
