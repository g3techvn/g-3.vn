import { useState, useEffect, useCallback } from 'react';
import { ImageItem } from '@/types/supabase';

interface UseSupabaseStorageProps {
  folder: string;
  bucket?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DebugInfo {
  error?: string;
  message?: string;
  suggested_folders?: string[];
  [key: string]: unknown;
}

interface UseSupabaseStorageResult {
  images: ImageItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  debug: DebugInfo | null;
  suggestedFolders: string[];
}

export function useSupabaseStorage({
  folder,
  bucket = 'g3tech',
  sortOrder = 'asc'
}: UseSupabaseStorageProps): UseSupabaseStorageResult {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<DebugInfo | null>(null);
  const [suggestedFolders, setSuggestedFolders] = useState<string[]>([]);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuggestedFolders([]);
      
      console.log(`Fetching images from: ${bucket}/${folder}`);
      const response = await fetch(`/api/images?folder=${encodeURIComponent(folder)}&bucket=${encodeURIComponent(bucket)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch images');
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      if (data.debug) {
        setDebug(data.debug);
        
        // Set suggested folders if available
        if (data.debug.suggested_folders && Array.isArray(data.debug.suggested_folders)) {
          setSuggestedFolders(data.debug.suggested_folders);
        }
      }
      
      const sortedImages = [...(data.images || [])];
      console.log(`Received ${sortedImages.length} images`);
      
      // Sort images by name based on the specified sort order
      sortedImages.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
      
      setImages(sortedImages);
    } catch (err) {
      console.error('Error in useSupabaseStorage:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [folder, bucket, sortOrder]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    refetch: fetchImages,
    debug,
    suggestedFolders
  };
} 