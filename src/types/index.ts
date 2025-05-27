// Định nghĩa các types chính cho dự án

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  image_square_url?: string;
  category_id: string;
  category_name?: string;
  pd_cat_id: string;
  brand_id: string;
  brand?: string;
  brand_slug?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  original_price?: number;
  discount_percentage?: number;
  slug?: string;
  video_url?: string;
  gallery_url?: string;
  content?: string;
  thong_so_ky_thuat?: { [key: string]: { title: string; value: string } };
  tinh_nang?: string | string[];
  loi_ich?: string | string[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Brand = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  image_url?: string;
};

export type Tag = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ProductTag = {
  product_id: string;
  tag_id: string;
};

// New types for domain-sector based filtering
export type Sector = {
  id: string;
  title: string; // Using domain as the title for filtering
  created_at: string;
  updated_at?: string;
};

export type ProductSector = {
  product_id: string;
  sector_id: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  total_price: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}; 