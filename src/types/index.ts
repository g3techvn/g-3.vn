// Định nghĩa các types chính cho dự án

import { Agent } from 'https';

declare global {
  interface RequestInit {
    agent?: Agent;
  }
}

export * from './cart';
export * from './rewards';

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
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  image_square_url?: string;
  cover_image_url?: string;
  gallery_url?: string[];
  video_url?: string;
  rating?: number;
  brand_id?: string;
  pd_cat_id?: string;
  category_id?: string;
  feature?: boolean;
  bestseller?: boolean;
  status?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  sold_count?: number;
  thong_so_ky_thuat?: Record<string, { title?: string; value?: string }>;
  tinh_nang?: string[];
  loi_ich?: string[];
  huong_dan?: string;
  comment?: string[];
  content?: string;
  created_at: string;
  updated_at: string;
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

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  province_code: string;
  district_code: string;
  ward_code: string;
  address_detail: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 