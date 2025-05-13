'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2   p-4 text-sm ">
      <Link
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700"
      >
        <HomeIcon className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              {item.label}
            </Link>
          ) : (
            <span className="ml-2 text-gray-700">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
} 