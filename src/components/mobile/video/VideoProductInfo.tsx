import { Product } from '@/types';
import { CheckIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, StarIcon } from '@heroicons/react/24/outline';

interface VideoProductInfoProps {
  product: Product;
  brandName?: string;
}

export function VideoProductInfo({ product, brandName }: VideoProductInfoProps) {
  // Mock rating data
  const ratingSummary = {
    average: product.rating || 4.1,
    total: 394168,
    stars: [
      { star: 5, count: 300000 },
      { star: 4, count: 60000 },
      { star: 3, count: 20000 },
      { star: 2, count: 8000 },
      { star: 1, count: 6200 },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Title and Brand */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
        {brandName && (
          <div className="text-sm text-gray-500">Thương hiệu {brandName}</div>
        )}
      </div>

      {/* Price */}
      <div className="space-y-1">
        <div className="text-xl font-bold text-red-600">
          {product.price && typeof product.price === 'number'
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)
            : product.price}
        </div>
        {product.original_price && (
          <div className="text-sm text-gray-400 line-through">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.original_price)}
          </div>
        )}
      </div>

      {/* Rating Summary */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <span className="ml-1 text-lg font-semibold">{ratingSummary.average}</span>
        </div>
        <div className="text-sm text-gray-500">
          {ratingSummary.total.toLocaleString()} đánh giá
        </div>
      </div>

      {/* Shipping Info */}
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <TruckIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>Bảo hành chính hãng 12 tháng</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ArrowPathIcon className="h-5 w-5 mr-2 text-gray-400" />
          <span>Đổi trả miễn phí trong 30 ngày</span>
        </div>
      </div>

      {/* Key Features */}
      {product.tinh_nang && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Tính năng nổi bật</h3>
          <ul className="space-y-2">
            {(Array.isArray(product.tinh_nang) ? product.tinh_nang : [product.tinh_nang]).map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Benefits */}
      {product.loi_ich && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Lợi ích</h3>
          <ul className="space-y-2">
            {(Array.isArray(product.loi_ich) ? product.loi_ich : [product.loi_ich]).map((benefit: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Specifications */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Thông số kỹ thuật</h3>
        {product.thong_so_ky_thuat ? (
          <div className="space-y-2">
            {Object.entries(product.thong_so_ky_thuat).map(([key, spec], index) => (
              <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm text-gray-600">{spec.title}</span>
                <span className="text-sm text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Thông số kỹ thuật đang được cập nhật...
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">{product.description}</p>
        </div>
      )}
    </div>
  );
} 