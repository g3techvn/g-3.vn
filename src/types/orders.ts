export interface Order {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email?: string | null;
  status: OrderStatus;
  total_price: number;
  payment_method: string;
  address: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  product_name: string;
  products: {
    name: string;
    image_url: string;
  };
}

export interface OrderProductListItem {
  id: string;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  display_name: string;
  display_image: string;
}

export interface OrderProductListProps {
  items: OrderProductListItem[];
  onUpdateQuantity: (params: UpdateQuantityParams) => void;
  onRemoveItem: (itemId: string) => void;
}

export interface UpdateQuantityParams {
  itemId: string;
  newQuantity: number;
}

export interface FormData {
  id?: number;
  user_id?: string;
  status: OrderStatus;
  total_amount: number;
  payment_method: string;
  payment_method_id?: number;
  shipping_address_id?: number;
  shipping_carrier_id?: number;
  tracking_number?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  items: OrderItem[];
  shipping_info: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    cityCode: number;
    district: string;
    districtCode: number;
    ward: string;
    wardCode: number;
  };
}

export interface NewOrderItem {
  product_id: number;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
  };
}

export const ORDER_STATUSES = [
  { value: 'pending' as OrderStatus, label: 'Chờ xử lý', color: 'yellow' },
  { value: 'processing' as OrderStatus, label: 'Đang xử lý', color: 'blue' },
  { value: 'shipped' as OrderStatus, label: 'Đã gửi hàng', color: 'indigo' },
  { value: 'delivered' as OrderStatus, label: 'Đã giao hàng', color: 'green' },
  { value: 'canceled' as OrderStatus, label: 'Đã hủy', color: 'red' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
] as const; 