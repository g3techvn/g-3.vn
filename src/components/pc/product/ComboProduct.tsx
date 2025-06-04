'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { Card, CardBadge, CardContent, CardHeader } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Rating } from '@/components/ui/Rating';
import { Product, Brand } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/pc/product/ProductCard';

interface ProductOption {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  isAvailable: boolean;
}

interface ComboItem {
  id: string;
  name: string;
  description: string;
  image: string;
  brand?: string;
  brand_id?: string;
  rating?: number;
  slug: string;
  options: ProductOption[];
}

// Extend Product type to include combo_products
interface ComboProduct extends Product {
  combo_products?: Product[];
}

const ProductOptionCard = ({
  option,
  isSelected,
  onSelect,
}: {
  option: ProductOption;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  return (
    <div 
      className={cn(
        "border rounded-md p-3 cursor-pointer transition-all",
        isSelected ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300",
        !option.isAvailable && "opacity-60 cursor-not-allowed"
      )}
      onClick={() => option.isAvailable && onSelect()}
    >
      <div className="flex items-center">
        <div className="relative w-16 h-16 mr-3 flex-shrink-0">
          <Image
            src={option.image}
            alt={option.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 64px, 64px"
          />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm text-gray-800 line-clamp-2">{option.name}</h4>
          <div className="mt-1 flex items-center">
            <span className="font-medium text-red-600">
              {option.price.toLocaleString('vi-VN')}₫
            </span>
            {option.originalPrice && (
              <span className="ml-2 text-xs text-gray-500 line-through">
                {option.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
            {option.discount && (
              <span className="ml-2 text-xs font-medium bg-red-100 text-red-600 px-1 rounded">
                -{option.discount}%
              </span>
            )}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center", 
            isSelected ? "border-red-500" : "border-gray-300"
          )}>
            {isSelected && (
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            )}
          </div>
        </div>
      </div>
      {!option.isAvailable && (
        <div className="text-xs text-red-600 mt-2">Hết hàng</div>
      )}
    </div>
  );
};

const ComboCard = ({ combo, selectedOptionId, brandNames }: { 
  combo: ComboItem, 
  selectedOptionId?: number,
  brandNames?: Record<string, string>
}) => {
  const selectedOption = combo.options.find(opt => opt.id === selectedOptionId) || combo.options[0];
  const { addToCart } = useCart();
  
  const getBrandName = () => {
    if (combo.brand) return combo.brand;
    if (combo.brand_id && brandNames && brandNames[combo.brand_id]) {
      return brandNames[combo.brand_id];
    }
    return '';
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Create a cart item from the combo and selected option
    const cartItem = {
      id: combo.id,
      name: combo.name,
      price: selectedOption.price,
      original_price: selectedOption.originalPrice,
      image: combo.image,
      quantity: 1,
      brand: getBrandName(),
      slug: combo.slug,
      description: combo.description || '',
      category_id: '',
      pd_cat_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addToCart(cartItem);
  };
  
  return (
    <Card className="group h-full">
      <CardHeader>
        {selectedOption.discount && (
          <CardBadge>-{selectedOption.discount}%</CardBadge>
        )}
        <AspectRatio ratio={1 / 1}>
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <Image
              src={combo.image}
              alt={combo.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 16vw"
            />
          </div>
        </AspectRatio>
      </CardHeader>
      
      <CardContent>
        <div className="text-xs text-gray-500 mb-1">{getBrandName()}</div>
        
        <h3 className="text-xs font-medium mb-2 text-gray-800 group-hover:text-red-600 line-clamp-2 h-[2.5rem]">
          {combo.name}
        </h3>
        
        <Rating value={combo.rating || 4} className="mb-2" />
        
        <div className="flex items-center justify-between mt-auto">
          <div>
            {selectedOption.originalPrice ? (
              <>
                <span className="text-gray-500 line-through text-xs">
                  {selectedOption.originalPrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-red-600 font-bold text-sm block">
                  {selectedOption.price.toLocaleString('vi-VN')}₫
                </span>
              </>
            ) : (
              <span className="text-red-600 font-bold text-sm">
                {selectedOption.price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
          <button 
            className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition-colors duration-200"
            aria-label="Thêm vào giỏ hàng"
            onClick={handleAddToCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const ComboDetailModal = ({ 
  combo, 
  selectedOptionId, 
  onSelectOption,
  onClose
}: { 
  combo: ComboItem, 
  selectedOptionId: number,
  onSelectOption: (optionId: number) => void,
  onClose: () => void
}) => {
  const { addToCart } = useCart();
  
  const calculateTotalPrice = () => {
    const option = combo.options.find(opt => opt.id === selectedOptionId);
    return option?.price || 0;
  };

  const calculateOriginalPrice = () => {
    const option = combo.options.find(opt => opt.id === selectedOptionId);
    return option?.originalPrice || option?.price || 0;
  };

  const calculateSavings = () => {
    return calculateOriginalPrice() - calculateTotalPrice();
  };

  const calculateSavingsPercentage = () => {
    const originalPrice = calculateOriginalPrice();
    const savings = calculateSavings();
    if (originalPrice === 0) return 0;
    return Math.round((savings / originalPrice) * 100);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const selectedOption = combo.options.find(opt => opt.id === selectedOptionId);
    if (!selectedOption) return;
    
    // Create a cart item from the combo and selected option
    const cartItem = {
      id: combo.id,
      name: combo.name,
      price: selectedOption.price,
      original_price: selectedOption.originalPrice,
      image: combo.image,
      quantity: 1,
      brand: combo.brand,
      brand_id: combo.brand_id || '',
      rating: combo.rating,
      slug: combo.slug || combo.id,
      description: combo.description || '',
      category_id: '',
      pd_cat_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addToCart(cartItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{combo.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto">
          <div className="md:flex">
            {/* Combo image */}
            <div className="md:w-2/5 p-6 bg-slate-50 flex items-center justify-center relative">
              
              <div className="relative w-full aspect-square max-w-xs">
                <Image
                  src={combo.image}
                  alt={combo.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>

            {/* Combo details and options */}
            <div className="md:w-3/5 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.name}</h3>
                <p className="text-gray-600">{combo.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Chọn cấu hình:</h4>
                  <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full">
                    {combo.options.length} phiên bản
                  </div>
                </div>
                {combo.options.map((option) => (
                  <ProductOptionCard
                    key={option.id}
                    option={option}
                    isSelected={selectedOptionId === option.id}
                    onSelect={() => onSelectOption(option.id)}
                  />
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Tổng tiền:</div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-red-600">
                        {calculateTotalPrice().toLocaleString('vi-VN')}₫
                      </span>
                      {calculateSavings() > 0 && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {calculateOriginalPrice().toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {calculateSavings() > 0 && (
                    <div className="bg-red-100 text-red-600 py-1 px-3 rounded-full text-sm font-medium mt-2 md:mt-0">
                      Tiết kiệm {calculateSavingsPercentage()}% ({calculateSavings().toLocaleString('vi-VN')}₫)
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link
                    href="#"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md text-center font-medium transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Mua ngay
                  </Link>
                  <button
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center"
                    onClick={handleAddToCart}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ComboProduct({ 
  products = [],
  loading = false,
  error = null,
  brands = []
}: {
  products: ComboProduct[];
  loading: boolean;
  error: string | null;
  brands?: Brand[];
}) {
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [brandNames, setBrandNames] = useState<Record<string, string>>({});

  // Build a map of brand_id to brand name
  useEffect(() => {
    if (brands.length > 0) {
      const brandMap: Record<string, string> = {};
      brands.forEach(brand => {
        brandMap[brand.id] = brand.title;
      });
      setBrandNames(brandMap);
    }
  }, [brands]);

  // Convert Product to ComboItem format
  const convertToComboItem = (product: Product): ComboItem => {
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      image: product.image_url || '',
      brand: product.brand,
      brand_id: product.brand_id,
      rating: product.rating,
      slug: product.slug || product.id,
      options: [{
        id: 1,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price,
        discount: product.discount_percentage,
        image: product.image_url || '',
        isAvailable: true
      }]
    };
  };

  const comboItems = products.map(convertToComboItem);

  // Tự động chọn option đầu tiên cho mỗi combo
  useEffect(() => {
    const newSelections: Record<string, number> = { ...selectedOptions };
    let changed = false;

    comboItems.forEach(combo => {
      if (selectedOptions[combo.id] === undefined) {
        const defaultOption = combo.options.find(opt => opt.isAvailable) || combo.options[0];
        if (defaultOption) {
          newSelections[combo.id] = defaultOption.id;
          changed = true;
        }
      }
    });

    if (changed) {
      setSelectedOptions(newSelections);
    }
  }, [comboItems, selectedOptions]);

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-6 inline-block uppercase">
          Combo Sản Phẩm
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
            Đã xảy ra lỗi: {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square w-full rounded-lg bg-gray-200" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : comboItems.length > 0 ? (
          <>
            {/* Layout with banner (4 cols) left and 2 products right */}
            <div className="grid grid-cols-6 gap-4 mb-4">
              {/* Banner - takes 4 columns */}
              <div className="col-span-6 lg:col-span-4 relative h-[250px] lg:h-[400px] rounded-lg overflow-hidden">
                <Image 
                  src="/images/header-img.jpg"
                  alt="Combo Sản Phẩm"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center pl-6 md:pl-12">
                  <h3 className="text-white text-lg md:text-2xl font-bold mb-1">Nội Thất Văn Phòng</h3>
                  <p className="text-white/90 text-xs md:text-sm max-w-md lg:max-w-lg">
                    Nâng tầm không gian làm việc với bộ sưu tập nội thất văn phòng cao cấp, thiết kế hiện đại và tiện nghi
                  </p>
                  <Link href="#" className="mt-3 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors max-w-fit">
                    Khám phá ngay
                  </Link>
                </div>
              </div>

              {/* First 2 products - takes 1 column each */}
              {comboItems.slice(0, 2).map((combo, index) => (
                <div key={combo.id} className="col-span-3 lg:col-span-1">
                  <ProductCard 
                    product={{
                      id: combo.id,
                      name: combo.name,
                      price: combo.options[0].price,
                      original_price: combo.options[0].originalPrice,
                      discount_percentage: combo.options[0].discount,
                      image_url: combo.image,
                      brand: combo.brand,
                      brand_id: combo.brand_id || '',
                      rating: combo.rating,
                      slug: combo.slug || combo.id,
                      description: combo.description || '',
                      category_id: '',
                      pd_cat_id: '',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Row 2 with remaining products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {comboItems.slice(2).map((combo, index) => (
                <ProductCard 
                  key={combo.id}
                  product={{
                    id: combo.id,
                    name: combo.name,
                    price: combo.options[0].price,
                    original_price: combo.options[0].originalPrice,
                    discount_percentage: combo.options[0].discount,
                    image_url: combo.image,
                    brand: combo.brand,
                    brand_id: combo.brand_id || '',
                    rating: combo.rating,
                    slug: combo.slug || combo.id,
                    description: combo.description || '',
                    category_id: '',
                    pd_cat_id: '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-base text-gray-600">Không tìm thấy sản phẩm nào.</p>
            <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau.</p>
          </div>
        )}
      </div>
    </section>
  );
} 