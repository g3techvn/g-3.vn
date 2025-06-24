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
  brands = []
}: {
  products: ComboProduct[];
  brands?: Brand[];
}) {
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert brands array to a map for easier lookup
  const brandNames = brands.reduce((acc, brand) => {
    acc[brand.id] = brand.title;
    return acc;
  }, {} as Record<string, string>);

  const convertToComboItem = (product: ComboProduct): ComboItem => {
    const options = product.combo_products?.map((comboProduct: Product, index: number) => ({
      id: index + 1,
      name: comboProduct.name,
      price: comboProduct.price,
      originalPrice: comboProduct.original_price,
      discount: comboProduct.discount_percentage,
      image: comboProduct.image_url || '',
      isAvailable: true // You might want to add actual availability logic here
    })) || [];

    return {
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      image: product.image_url || '',
      brand: product.brand,
      brand_id: product.brand_id,
      rating: product.rating,
      slug: product.slug || product.id.toString(),
      options
    };
  };

  const handleComboClick = (combo: ComboItem) => {
    setSelectedCombo(combo);
    setSelectedOptionId(combo.options[0]?.id || null);
    setIsModalOpen(true);
  };

  const handleOptionSelect = (optionId: number) => {
    setSelectedOptionId(optionId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCombo(null);
    setSelectedOptionId(null);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-6 uppercase">
          Combo sản phẩm
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product) => {
            const comboItem = convertToComboItem(product);
            return (
              <Link 
                key={product.id} 
                href={`/san-pham/${product.slug || product.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleComboClick(comboItem);
                }}
              >
                <ComboCard 
                  combo={comboItem} 
                  selectedOptionId={comboItem.options[0]?.id}
                  brandNames={brandNames}
                />
              </Link>
            );
          })}
        </div>

        {/* Modal */}
        {isModalOpen && selectedCombo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCombo.name}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCombo.options.map((option) => (
                    <ProductOptionCard
                      key={option.id}
                      option={option}
                      isSelected={option.id === selectedOptionId}
                      onSelect={() => handleOptionSelect(option.id)}
                    />
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={closeModal}>
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 