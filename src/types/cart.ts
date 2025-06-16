import { User as BaseUser } from './index';
import { ProductVariant } from '@/types';

// Simplified user type for cart context
export type CartUser = Pick<BaseUser, 'id' | 'email' | 'name' | 'address' | 'phone'>;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  quantity: number;
  image: string;
  variant?: ProductVariant;
  weight?: number; // Weight in grams
  length?: number; // Length in cm
  width?: number;  // Width in cm
  height?: number; // Height in cm
}

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  expiryDate: string;
}

export interface BuyerInfoProps {
  user: CartUser | null;
  guestInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  userPhone: string;
  errors: {
    fullName: string;
    phone: string;
  };
}

export interface ShippingInfoProps {
  addressForm: {
    city: string;
    district: string;
    ward: string;
    address: string;
  };
  selectedCarrier: string;
  carriers: Array<{
    id: string;
    name: string;
    price: number;
    time: string;
  }>;
  cities: Array<{code: number, name: string}>;
  districts: Array<{code: number, name: string}>;
  wards: Array<{code: number, name: string}>;
  loadingCities: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  showAddressDrawer: boolean;
  showShippingDrawer: boolean;
  note: string;
} 