'use client';

import { useState, useEffect } from 'react';
import { RewardTransaction, UserRewardsResponse } from '@/types/rewards';
import { Button } from '@/components/ui/Button';

interface RewardPointsHistoryProps {
  user: { id: string; fullName: string } | null;
}

export default function RewardPointsHistory({ user }: RewardPointsHistoryProps) {
  const [data, setData] = useState<UserRewardsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRewardHistory = async (page: number = 1) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/user/rewards?page=${page}&limit=10`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || 'Không thể tải lịch sử điểm thưởng');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
      console.error('Error fetching reward history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardHistory(currentPage);
  }, [user, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'earn') {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </div>
      );
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Vui lòng đăng nhập để xem lịch sử điểm thưởng</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => fetchRewardHistory(currentPage)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      {data?.points && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {data.points.available.toLocaleString()} điểm
            </div>
            <div className="text-red-100">
              Điểm khả dụng • Tương đương {(data.points.available * data.points.pointValue).toLocaleString()}đ
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{data.points.total.toLocaleString()}</div>
              <div className="text-red-100">Tổng điểm tích lũy</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{data.points.maxPointsPerOrder.toLocaleString()}</div>
              <div className="text-red-100">Tối đa/đơn hàng</div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Lịch sử giao dịch</h3>
        
        {data?.transactions && data.transactions.length > 0 ? (
          <div className="space-y-3">
            {data.transactions.map((transaction, index) => {
              // Calculate remaining balance up to this transaction
              let remainingBalance = 0;
              for (let i = data.transactions.length - 1; i >= index; i--) {
                const t = data.transactions[i];
                if (t.type === 'earn') {
                  remainingBalance += t.points;
                } else if (t.type === 'redeem') {
                  remainingBalance -= t.points;
                }
              }

              return (
                <div key={transaction.id} className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200">
                  {getTransactionIcon(transaction.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {transaction.reason}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </div>
                    {transaction.related_order_id && (
                      <div className="text-xs text-blue-600">
                        Đơn hàng: #{transaction.related_order_id}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {transaction.type === 'earn' ? (
                      <div className="text-green-600 font-semibold">
                        +{transaction.points.toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-red-600 font-semibold">
                        -{transaction.points.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Còn lại: {Math.max(0, remainingBalance).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Chưa có giao dịch điểm thưởng nào
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Trước
            </Button>
            
            {[...Array(Math.min(5, data.pagination.pages))].map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.pagination.pages}
              variant="outline"
              size="sm"
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 