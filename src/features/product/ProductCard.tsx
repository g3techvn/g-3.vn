import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, truncateText } from '@/utils/helpers';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, image_url, description } = product;

  return (
    <div className="group relative overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <Link href={`/products/${id}`} className="block">
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={image_url || '/placeholder-product.jpg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-medium text-gray-900">{name}</h3>
          <p className="mb-2 text-sm text-gray-500">{truncateText(description, 80)}</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(price)}</p>
        </div>
      </Link>
      <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button
          className="rounded-full bg-primary p-3 text-white shadow-md hover:bg-primary/90"
          aria-label="Add to cart"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
      </div>
    </div>
  );
} 