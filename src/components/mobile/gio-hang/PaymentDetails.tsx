'use client';

import OrderSummary from './OrderSummary';
import RewardPoints from './RewardPoints';
import PaymentMethodSelection from './PaymentMethodSelection';
import { Voucher } from '@/types/cart';

interface PaymentDetailsProps {
  user: {
    fullName: string;
    email: string;
  } | null;
  totalPrice: number;
  shipping: number;
  selectedVoucher: Voucher | null;
  pointsDiscount: number;
  useRewardPoints: boolean;
  setUseRewardPoints: (use: boolean) => void;
  pointsToUse: number;
  setPointsToUse: (points: number) => void;
  rewardPoints: {
    available: number;
    pointValue: number;
    minPointsToRedeem: number;
    maxPointsPerOrder: number;
  };
  showPaymentDrawer: boolean;
  setShowPaymentDrawer: (show: boolean) => void;
  selectedPayment: string;
  setSelectedPayment: (method: string) => void;
  paymentMethods: {
    id: string;
    name: string;
    icon: string;
    description: string;
  }[];
}

export default function PaymentDetails({
  user,
  totalPrice,
  shipping,
  selectedVoucher,
  pointsDiscount,
  useRewardPoints,
  setUseRewardPoints,
  pointsToUse,
  setPointsToUse,
  rewardPoints,
  showPaymentDrawer,
  setShowPaymentDrawer,
  selectedPayment,
  setSelectedPayment,
  paymentMethods
}: PaymentDetailsProps) {
  return (
    <div>
      <div className="flex items-center mb-3 mt-6">
        <div className="w-8 h-8 mr-2">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.82 1.62 2.02 1.62 1.19 0 1.78-.6 1.78-1.53 0-.9-.59-1.46-2.05-1.87-1.77-.46-3.19-1.29-3.19-3.06 0-1.63 1.32-2.71 3.11-3.06V5h2.67v1.8c1.71.39 2.73 1.71 2.83 3.24h-2.1c-.1-.92-.71-1.52-1.74-1.52-.93 0-1.65.47-1.65 1.39 0 .84.58 1.26 2.01 1.67 1.8.51 3.29 1.29 3.29 3.19 0 1.77-1.39 2.83-3.1 3.16z" fill="#DC2626"/>
          </svg>
        </div>
        <span className="text-lg font-medium">Chi tiết thanh toán</span>
      </div>
      
      <div className="bg-white p-4 rounded-md">
        <OrderSummary
          totalPrice={totalPrice}
          shipping={shipping}
          selectedVoucher={selectedVoucher}
          pointsDiscount={pointsDiscount}
        />
        
        <RewardPoints
          user={user}
          useRewardPoints={useRewardPoints}
          setUseRewardPoints={setUseRewardPoints}
          pointsToUse={pointsToUse}
          setPointsToUse={setPointsToUse}
          rewardPoints={rewardPoints}
        />

        <PaymentMethodSelection
          showPaymentDrawer={showPaymentDrawer}
          setShowPaymentDrawer={setShowPaymentDrawer}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          paymentMethods={paymentMethods}
        />
      </div>
    </div>
  );
} 