'use client';

import Link from 'next/link';

interface RewardPointsProps {
  user: {
    fullName: string;
    email: string;
  } | null;
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
}

export default function RewardPoints({
  user,
  useRewardPoints,
  setUseRewardPoints,
  pointsToUse,
  setPointsToUse,
  rewardPoints
}: RewardPointsProps) {
  return (
    <div className="flex py-3 border-b border-gray-100">
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-800">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
      </div>
      <div className="flex-1">
        {user ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-gray-800 font-medium">Điểm thưởng khả dụng: {rewardPoints.available}</div>
                <div className="text-gray-500 text-sm">1 điểm = {rewardPoints.pointValue.toLocaleString()}đ</div>
              </div>
              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={useRewardPoints}
                    onChange={(e) => {
                      setUseRewardPoints(e.target.checked);
                      if (!e.target.checked) {
                        setPointsToUse(0);
                      } else {
                        setPointsToUse(Math.min(rewardPoints.available, rewardPoints.maxPointsPerOrder));
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
            {useRewardPoints && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="range"
                    min={rewardPoints.minPointsToRedeem}
                    max={Math.min(rewardPoints.available, rewardPoints.maxPointsPerOrder)}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{rewardPoints.minPointsToRedeem} điểm</span>
                  <span>{Math.min(rewardPoints.available, rewardPoints.maxPointsPerOrder)} điểm</span>
                </div>
                <div className="text-red-600 font-medium">
                  Sử dụng {pointsToUse} điểm = Giảm {(pointsToUse * rewardPoints.pointValue).toLocaleString()}đ
                </div>
                <div className="text-gray-500 text-xs">
                  Tối thiểu {rewardPoints.minPointsToRedeem} điểm và tối đa {rewardPoints.maxPointsPerOrder} điểm mỗi đơn
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-800 font-medium">Điểm thưởng</div>
            <div className="text-gray-500 text-sm">Đăng nhập để sử dụng và tích lũy điểm thưởng</div>
            <Link
              href="/dang-nhap"
              className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 