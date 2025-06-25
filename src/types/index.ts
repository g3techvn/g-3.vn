// Định nghĩa các types chính cho dự án

export type ProductVariant = {
  id: number;
  product_id: number;
  color: string;
  size: string;
  weight: number;
  price: number;
  original_price: number;
  image_url: string;
  gallery_url: string;
  sku: string;
  stock_quantity: number;
  is_default: boolean;
  created_at: string;
  is_dropship: boolean;
  gac_chan: boolean;
};

export interface ProductSpecification {
  title: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  original_price?: number;
  images?: string[];
  image_url?: string;
  video_url?: string;
  variants?: ProductVariant[];
  category?: Category;
  brand?: Brand;
  brand_id?: string;
  pd_cat_id?: string;
  category_id?: string;
  category_name?: string;
  image_square_url?: string;
  specifications?: ProductSpecification[];
  features?: string[];
  benefits?: string[];
  instructions?: string[];
  overview?: string;
  is_available?: boolean;
  status?: boolean;
  stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock';
  rating?: number;
  review_count?: number;
  sold_count?: number;
  created_at?: string;
  updated_at?: string;
  feature?: boolean;
  gallery_url?: string;
  brand_slug?: string;
  content?: string;
  discount_percentage?: number;
  thong_so_ky_thuat?: Record<string, { title?: string; value?: string }>;
  tinh_nang?: string[];
  loi_ich?: string[];
}

export type Category = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  image_square_url?: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Brand = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  image_url?: string;
  image_square_url?: string;
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
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  subtotal: number;
  shipping_fee: number;
  voucher_code?: string | null;
  voucher_discount: number;
  points_used: number;
  points_discount: number;
  total_price: number;
  payment_method: string;
  shipping_address: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  variant_id?: string | null;
  variant_details?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image: string;
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

// CartItem type has been moved to @/types/cart.ts 