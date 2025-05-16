// Supabase storage related types
export interface StorageItem {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    contentType: string;
  };
}

export interface ImageItem {
  name: string;
  url: string;
  alternativeUrl?: string;
  size?: number;
  type?: string;
  created_at?: string;
}

export interface BucketInfo {
  id: string;
  name: string;
  owner: string;
  public: boolean;
  created_at: string;
  updated_at: string;
} 