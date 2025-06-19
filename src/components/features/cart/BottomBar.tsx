'use client';

interface BottomBarProps {
  cartItemCount: number;
  total: number;
}

export default function BottomBar({
  cartItemCount,
  total
}: BottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex justify-between items-center z-[9999] shadow-lg">
      <div className="flex flex-col justify-center h-full">
        <div className="text-gray-500 text-[10px] leading-tight">{cartItemCount} sản phẩm</div>
        <div className="text-gray-500 text-[10px] leading-tight">Tổng thanh toán</div>
        <div className="text-base font-bold leading-tight">{total.toLocaleString()}đ</div>
      </div>
      <button className="bg-[#DC2626] text-white px-8 rounded-full font-medium flex items-center h-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        Đặt hàng
      </button>
    </div>
  );
} 