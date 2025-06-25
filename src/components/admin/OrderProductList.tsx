import React from 'react';
import Image from 'next/image';
import { X, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
  product_image?: string;
}

interface OrderProductListProps {
  items: OrderItem[];
  loading: boolean;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  readOnly?: boolean;
}

export default function OrderProductList({
  items,
  loading,
  onUpdateQuantity,
  onRemoveItem,
  readOnly = false
}: OrderProductListProps) {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 py-4 border-b">
          <div className="relative w-20 h-20">
            <Image
              src={item.product_image || '/placeholder.png'}
              alt={item.product_name}
              fill
              className="object-cover rounded-md"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium">{item.product_name}</h3>
            <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
            
            {!readOnly && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          {!readOnly && (
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 