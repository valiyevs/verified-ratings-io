import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to generate signed URLs for private storage bucket images
 * Used for review images that are stored in the private 'review-images' bucket
 */
export const useSignedImageUrl = (imageUrl: string | undefined | null) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSignedUrl = async () => {
      if (!imageUrl) {
        setSignedUrl(null);
        return;
      }

      // Check if this is a Supabase storage URL
      const storagePattern = /\/storage\/v1\/object\/public\/review-images\/(.+)$/;
      const match = imageUrl.match(storagePattern);

      if (!match) {
        // Not a Supabase storage URL, use as-is (external URLs)
        setSignedUrl(imageUrl);
        return;
      }

      const filePath = decodeURIComponent(match[1]);
      setLoading(true);
      setError(null);

      try {
        const { data, error: signError } = await supabase.storage
          .from('review-images')
          .createSignedUrl(filePath, 3600); // 1 hour expiration

        if (signError) {
          console.error('Error creating signed URL:', signError);
          setError(signError.message);
          setSignedUrl(null);
        } else if (data) {
          setSignedUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Error generating signed URL:', err);
        setError('Failed to load image');
        setSignedUrl(null);
      } finally {
        setLoading(false);
      }
    };

    generateSignedUrl();
  }, [imageUrl]);

  return { signedUrl, loading, error };
};

/**
 * Utility function to generate signed URL (for non-hook contexts)
 */
export const getSignedImageUrl = async (imageUrl: string): Promise<string | null> => {
  const storagePattern = /\/storage\/v1\/object\/public\/review-images\/(.+)$/;
  const match = imageUrl.match(storagePattern);

  if (!match) {
    return imageUrl; // Not a Supabase storage URL
  }

  const filePath = decodeURIComponent(match[1]);

  try {
    const { data, error } = await supabase.storage
      .from('review-images')
      .createSignedUrl(filePath, 3600);

    if (error || !data) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return null;
  }
};
