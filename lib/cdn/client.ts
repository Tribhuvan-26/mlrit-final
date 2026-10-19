import { supabase } from '@/lib/supabase';

export const ASSETS_BUCKET = 'assets';

/**
 * Public URL for an object in the `assets` bucket. Assumes the bucket is
 * public; for a private bucket use createSignedUrl instead.
 */
export function getAssetUrl(key: string): string {
  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

