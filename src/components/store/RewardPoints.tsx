'use client'

import Link from 'next/link'
import { Switch } from '@/components/ui/Switch'
import { Slider } from '@/components/ui/Slider'
import { Button } from '@/components/ui/Button'

interface RewardPointsProps {
  isLoggedIn: boolean;
  availablePoints: number;
  useRewardPoints: boolean;
  setUseRewardPoints: (use: boolean) => void;
  pointsToUse: number;
  setPointsToUse: (points: number) => void;
  maxPointsToUse: number;
  openProfile?: () => void;
}

export default function RewardPoints({
  isLoggedIn,
  availablePoints,
  useRewardPoints,
  setUseRewardPoints,
  pointsToUse,
  setPointsToUse,
  maxPointsToUse,
  openProfile
}: RewardPointsProps) {
  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium">Điểm thưởng</div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Sử dụng điểm thưởng</div>
              <div className="text-sm text-gray-500 mt-1">
                Đăng nhập để tích lũy và sử dụng điểm thưởng
              </div>
            </div>
            <Button
              onClick={openProfile}
              className="flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Đăng nhập
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Điểm thưởng</div>
          <div className="text-sm text-gray-500">
            Bạn có {availablePoints.toLocaleString()} điểm thưởng
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Use Points Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <Switch
              checked={useRewardPoints}
              onCheckedChange={(checked: boolean) => {
                setUseRewardPoints(checked);
                if (!checked) {
                  setPointsToUse(0);
                } else {
                  setPointsToUse(Math.min(availablePoints, maxPointsToUse));
                }
              }}
            />
            <span className="text-sm font-medium text-gray-700">
              Sử dụng điểm thưởng
            </span>
          </label>
          {useRewardPoints && (
            <div className="text-sm text-gray-500">
              Tối đa: {maxPointsToUse.toLocaleString()} điểm
            </div>
          )}
        </div>

        {/* Points Slider */}
        {useRewardPoints && (
          <div className="space-y-2">
            <Slider
              value={[pointsToUse]}
              onValueChange={(value) => setPointsToUse(value[0])}
              min={0}
              max={maxPointsToUse}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">0 điểm</div>
              <div className="font-medium text-red-600">
                {pointsToUse.toLocaleString()} điểm
              </div>
              <div className="text-gray-500">{maxPointsToUse.toLocaleString()} điểm</div>
            </div>
            <div className="text-sm text-gray-500">
              Tương đương: {(pointsToUse / 100).toLocaleString()}đ
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 