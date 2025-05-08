import React from 'react';
import Image from 'next/image';

const MobileBestsellerProducts: React.FC = () => {
  return (
    <section className="pt-4">
      <h2 className="text-lg font-semibold mb-2 text-red-700 px-4">Sản phẩm bán chạy</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4">
        <div className="min-w-[220px] bg-white rounded-lg shadow">
          <div className="relative w-full h-28">
            <Image 
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format" 
              alt="product1" 
              fill
              className="rounded-t-lg object-cover" 
            />
          </div>
          <div className="p-2">
            <div className="font-medium text-sm">Ghế công thái học X1</div>
            <div className="text-xs text-gray-500">Giảm giá 20%</div>
          </div>
        </div>
        <div className="min-w-[220px] bg-white rounded-lg shadow">
          <div className="relative w-full h-28">
            <Image 
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format" 
              alt="product2" 
              fill
              className="rounded-t-lg object-cover" 
            />
          </div>
          <div className="p-2">
            <div className="font-medium text-sm">Bàn nâng hạ thông minh</div>
            <div className="text-xs text-gray-500">Mới ra mắt</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileBestsellerProducts; 