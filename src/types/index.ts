// Định nghĩa các types chính cho dự án

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  brand_id: string;
  brand?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  original_price?: number;
  discount_percentage?: number;
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
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
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