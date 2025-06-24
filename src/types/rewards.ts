export interface RewardPoints {
  available: number;
  total: number;
  pointValue: number; // Value in VND per point (e.g., 1000 VND per point)
  minPointsToRedeem: number;
  maxPointsPerOrder: number;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'redeem';
  points: number;
  reason: string;
  related_order_id?: string;
  created_at: string;
}

export interface VoucherUsage {
  id: string;
  user_id: string;
  voucher_id: string;
  voucher_code: string;
  order_id?: string | null;
  discount_amount: number;
  used_at: string;
}

export interface VoucherValidation {
  valid: boolean;
  voucher?: {
    id: string;
    code: string;
    title: string;
    description: string;
    discountAmount: number;
    discountType: 'fixed' | 'percentage';
    minOrderValue: number;
    expiryDate: string;
  };
  error?: string;
  message?: string;
}

export interface UserRewardsResponse {
  points: RewardPoints;
  transactions: RewardTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
} 