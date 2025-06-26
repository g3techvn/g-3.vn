import React from 'react';
import Image from 'next/image';
import { formatPrice } from '@/utils/helpers';
import { Button } from '@/components/ui/Button';

interface OrderProductListItem {
  id: string;
  product_id: number;
  quantity: number;
  price: number;
  total_price: number;
  display_name: string;
  display_image: string;
}

interface OrderProductListProps {
  items: OrderProductListItem[];
  onUpdateQuantity: (params: { itemId: string; newQuantity: number }) => void;
  onRemoveItem: (itemId: string) => void;
}

export default function OrderProductList({ items, onUpdateQuantity, onRemoveItem }: OrderProductListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
          <div className="relative w-20 h-20">
            <Image
              src={item.display_image}
              alt={item.display_name}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{item.display_name}</h3>
            <div className="flex items-center space-x-4 mt-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity({
                  itemId: item.id,
                  newQuantity: parseInt(e.target.value) || 1
                })}
                className="w-20 border border-gray-300 rounded px-2 py-1"
              />
              <p className="text-sm text-gray-500">
                x {formatPrice(item.price)}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="font-medium">{formatPrice(item.total_price)}</p>
            <Button
              onClick={() => onRemoveItem(item.id)}
              variant="destructive"
              size="sm"
            >
              Xóa
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 