import React, { useState, useEffect } from 'react';
import ProductTabsRadix from './ProductTabsRadix';
import { ProductTabsRadixSkeleton } from './skeletons';

// Định nghĩa kiểu dữ liệu cho tabs
interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  image: string;
  images?: string[];
  brand: string;
  rating?: number;
  url: string;
}

interface Tab {
  id: string;
  name: string;
  products: Product[];
}

interface ProductTabsWithSkeletonProps {
  title: string;
  fetchTabs: () => Promise<Tab[]>;
}

export default function ProductTabsWithSkeleton({ 
  title, 
  fetchTabs
}: ProductTabsWithSkeletonProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTabs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Thêm timeout để giả lập độ trễ mạng (chỉ dùng cho demo)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const data = await fetchTabs();
        setTabs(data);
      } catch (err) {
        console.error('Failed to fetch tabs:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadTabs();
  }, [fetchTabs]);

  // Hiển thị skeleton trong khi loading
  if (loading) {
    return <ProductTabsRadixSkeleton />;
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <div className="py-10 bg-gray-100">
        <div className="container mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => setLoading(true)} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị component chính khi đã tải xong dữ liệu
  return <ProductTabsRadix title={title} tabs={tabs} />;
} 