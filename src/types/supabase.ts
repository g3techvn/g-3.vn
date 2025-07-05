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

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          sale_price?: number;
          original_price?: number;
          image_url?: string;
          gallery_url?: string;
          video_url?: string;
          status?: boolean;
          stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock';
          category_id?: string;
          pd_cat_id?: string;
          brand_id?: string;
          brand_slug?: string;
          mobile_featured?: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          total: number;
          created_at: string;
          updated_at: string;
        };
      };
      product_cats: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description?: string;
          image_url?: string;
          image_square_url?: string;
          status?: boolean;
          sector_id?: string;
          product_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          title: string;
          slug: string;
          image_url?: string;
          image_square_url?: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
} 