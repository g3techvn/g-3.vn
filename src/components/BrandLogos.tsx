import React from 'react';
import Link from 'next/link';
import { Tooltip, TooltipProvider } from '@/components/ui/Tooltip';
import { motion } from 'framer-motion';

// Định nghĩa các thương hiệu
const brands = [
  { 
    name: 'YUNTENG', 
    color: '#0864b1', 
    url: '/brands/yunteng', 
    fontWeight: '600',
    description: 'Sản phẩm chính: Tripod, Monopod, Gimbal và phụ kiện máy ảnh'
  },
  { 
    name: 'Ulanzi', 
    color: '#e5004f', 
    url: '/brands/ulanzi', 
    fontWeight: '400',
    description: 'Phụ kiện sáng tạo cho nhiếp ảnh và quay phim'
  },
  { 
    name: 'AUKEY', 
    color: '#00b798', 
    url: '/brands/aukey', 
    fontWeight: '600',
    description: 'Phụ kiện công nghệ, sạc, adapter chất lượng cao'
  },
  { 
    name: 'TELESIN', 
    color: '#000000', 
    url: '/brands/telesin', 
    fontWeight: '600',
    description: 'Phụ kiện chuyên dụng cho GoPro và action camera'
  },
  { 
    name: 'PULUZ', 
    color: '#2175c7', 
    url: '/brands/puluz', 
    fontWeight: '600',
    description: 'Phụ kiện nhiếp ảnh đa dạng, chất lượng'
  },
  { 
    name: 'BOYA', 
    color: '#000000', 
    url: '/brands/boya', 
    fontWeight: '600',
    description: 'Thiết bị thu âm, microphone chuyên nghiệp'
  },
  { 
    name: 'Baseus', 
    color: '#1a1a1a', 
    url: '/brands/baseus', 
    fontWeight: '600',
    description: 'Phụ kiện điện tử cao cấp và sạc nhanh'
  },
];

export default function BrandLogos() {
  return (
    <TooltipProvider>
      <section className="py-8 bg-gray-100 border-y border-gray-100">
        <div className="container bg-white mx-auto px-4 rounded-lg py-4">
          <div className="flex flex-wrap items-center justify-center md:justify-between">
            {brands.map((brand, index) => (
              <Tooltip key={index} content={brand.description}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link 
                    href={brand.url}
                    className="mx-4 md:mx-0 my-3 block"
                  >
                    <div className="h-8 flex items-center justify-center">
                      <span 
                        style={{ 
                          color: brand.color, 
                          fontWeight: brand.fontWeight,
                          letterSpacing: brand.name === 'PULUZ' ? '1px' : 'normal' 
                        }}
                        className="text-2xl transition-all hover:opacity-100"
                      >
                        {brand.name}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </Tooltip>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
} 