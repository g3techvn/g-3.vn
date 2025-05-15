import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipProvider } from '@/components/ui/Tooltip';
import { motion } from 'framer-motion';
import { Brand } from '@/types';
import Image from 'next/image';

export default function BrandLogos() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error(`Lỗi HTTP ${response.status}`);
      }
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleImageError = (brandId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [brandId]: true
    }));
  };

  return (
    <TooltipProvider>
      <section className="py-8 bg-gray-100 border-y border-gray-100">
        <div className="container bg-white mx-auto px-4 rounded-lg py-4">
          <div className="flex flex-wrap items-center justify-center md:justify-between">
            {loading ? (
              [...Array(7)].map((_, i) => (
                <div key={i} className="mx-4 md:mx-0 my-3 block h-8 w-24 bg-gray-200 rounded animate-pulse" />
              ))
            ) : error ? (
              <div className="text-center text-red-600 w-full">{error}</div>
            ) : brands.length > 0 ? (
              brands.map((brand, index) => (
                <Tooltip key={brand.id} content={brand.title}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Link 
                      href={`/brands/${brand.slug}`}
                      className="mx-4 md:mx-0 my-3 block"
                    >
                      <div className="h-8 flex items-center justify-center">
                        {brand.image_url && !imageErrors[brand.id] ? (
                          <Image
                            src={brand.image_url}
                            alt={brand.title}
                            width={90}
                            height={32}
                            style={{ objectFit: 'contain', height: '2rem', width: 'auto', maxWidth: '90px' }}
                            onError={() => handleImageError(brand.id)}
                            unoptimized
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-gray-700">
                            {brand.title.charAt(0)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                </Tooltip>
              ))
            ) : (
              <div className="text-center text-gray-600 w-full">Không tìm thấy thương hiệu nào.</div>
            )}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
} 