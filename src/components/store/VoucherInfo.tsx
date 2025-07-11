'use client'

import React, { useState, useEffect, memo } from 'react';
import { TagsOutlined, PercentageOutlined, GiftOutlined } from '@ant-design/icons';
import Link from 'next/link'
import { Voucher } from '@/types/cart'
import { useToast } from "@/hooks/useToast"
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'

interface VoucherInfoProps {
  user: {
    fullName: string;
    email: string;
  } | null;
  showVoucherDrawer: boolean;
  setShowVoucherDrawer: (show: boolean) => void;
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  selectedVoucher: Voucher | null;
  setSelectedVoucher: (voucher: Voucher | null) => void;
  availableVouchers: Voucher[];
  totalPrice: number;
  openProfile?: () => void;
}

export default function VoucherInfo({
  user,
  showVoucherDrawer,
  setShowVoucherDrawer,
  voucherCode,
  setVoucherCode,
  selectedVoucher,
  setSelectedVoucher,
  availableVouchers,
  totalPrice,
  openProfile
}: VoucherInfoProps) {
  const { showToast } = useToast();

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium">Thông tin voucher</div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900">Mã giảm giá</div>
              <div className="text-sm text-gray-500 mt-1">
                Đăng nhập để áp dụng voucher và nhận ưu đãi
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Thông tin voucher</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Voucher Code Input */}
        <div>
          <label htmlFor="voucherCode" className="block text-sm font-medium text-gray-700 mb-1">
            Mã Voucher
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              id="voucherCode"
              className="flex-1"
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            />
            <Button
              disabled={!voucherCode.trim()}
              onClick={() => {
                const foundVoucher = availableVouchers.find(v => v.code === voucherCode);
                if (foundVoucher) {
                  setSelectedVoucher(foundVoucher);
                  showToast('Áp dụng voucher thành công!', 'default');
                } else {
                  showToast('Mã voucher không hợp lệ hoặc đã hết hạn', 'destructive');
                }
                setVoucherCode('');
              }}
            >
              Áp dụng
            </Button>
          </div>
        </div>

        {/* Available Vouchers */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">
            Voucher có sẵn ({availableVouchers.length})
          </div>
          <div className="space-y-3">
            {availableVouchers.map((voucher, index) => (
              <div
                key={voucher.id || `voucher-${index}`}
                className={`p-4 rounded-lg border ${selectedVoucher?.id === voucher.id ? 'border-red-500 bg-red-50' : 'border-gray-200'} cursor-pointer`}
                onClick={() => {
                  if (totalPrice >= voucher.minOrderValue) {
                    setSelectedVoucher(voucher);
                    showToast('Áp dụng voucher thành công!', 'default');
                  } else {
                    showToast(`Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này`, 'destructive');
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-red-600">{voucher.title}</div>
                  <div className="text-sm text-gray-500">HSD: {new Date(voucher.expiryDate).toLocaleDateString()}</div>
                </div>
                <div className="text-sm text-gray-600">{voucher.description}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Voucher */}
        {selectedVoucher && (
          <div className="p-4 rounded-lg border border-red-500 bg-red-50">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-red-600">Voucher đã chọn</div>
              <button
                onClick={() => {
                  setSelectedVoucher(null);
                  showToast('Đã hủy voucher', 'default');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600">{selectedVoucher.title}</div>
            <div className="text-sm text-gray-500 mt-1">
              Giảm {selectedVoucher.discountAmount.toLocaleString()}đ
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 