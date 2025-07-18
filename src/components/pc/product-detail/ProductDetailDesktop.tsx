import React, { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { Breadcrumb } from '@/components/pc/common/Breadcrumb';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { ProductDescription } from './ProductDescription';
import * as Separator from '@radix-ui/react-separator';
import { motion } from 'framer-motion';
import { ProductVariants } from './ProductVariants';
import { formatCurrency } from '@/utils/helpers';
import dynamic from 'next/dynamic';
import { TechnicalSpecs } from './TechnicalSpecs';
import { FAQ } from './FAQ';
import { ReviewsSection } from './ReviewsSection';
import { SimilarProducts } from './SimilarProducts';

interface Comment {
  id: string;
  user: {
    name: string;
  };
  rating: number;
  content: string;
  date: string;
  likes: number;
  publisherReply?: {
    name: string;
    date: string;
    content: string;
  };
}

// Define the benefits type to match what's used in ProductDescription
type Benefits = string[] | { benefits: string[] } | string;

export interface ProductDetailDesktopProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant | null) => void;
  galleryImages: string[];
  isLoadingGallery: boolean;
  videoInfo: {
    videoUrl: string;
    thumbnail: string;
  };
  comments: Comment[];
  ratingSummary: {
    average: number;
    total: number;
    stars: {
      star: number;
      count: number;
    }[];
  };
  similarProducts: Product[];
  loadingSimilar: boolean;
  technicalSpecs: Array<{ title: string; value: string; }>;
  keyFeatures: string[];
  benefits: Benefits;
  instructions: string[];
  overview: string;
}

export function ProductDetailDesktop({
  product,
  galleryImages,
  isLoadingGallery,
  videoInfo,
  comments,
  ratingSummary,
  similarProducts,
  loadingSimilar,
  technicalSpecs,
  keyFeatures,
  benefits,
  instructions,
  overview,
  selectedVariant,
  onSelectVariant
}: ProductDetailDesktopProps) {
  
  // Create galleryItems based on product and fetched gallery images
  const galleryItems = [
    ...(selectedVariant?.image_url ? [{ type: 'image' as const, url: selectedVariant.image_url }] : 
       product?.image_url ? [{ type: 'image' as const, url: product.image_url }] : []),
    ...(videoInfo.videoUrl && videoInfo.thumbnail ? [{ 
      type: 'video' as const, 
      url: '', 
      videoUrl: videoInfo.videoUrl, 
      thumbnail: videoInfo.thumbnail 
    }] : []),
    ...galleryImages
      .filter(url => url !== product?.image_url && url !== selectedVariant?.image_url)
      .map(url => ({ type: 'image' as const, url }))
  ];

  // Get current price and original price based on selected variant
  const currentPrice = selectedVariant?.price || product.price;
  const originalPrice = selectedVariant?.original_price || product.original_price;
  
  // Navigation scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <motion.div 
      className="container mx-auto py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Sản phẩm', href: '/san-pham' },
          { label: product.name }
        ]}
      />
      
      <div className="mt-8" id="overview">
        {/* Product Content */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-8 relative overflow-visible"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Product Gallery - 3 columns */}
          <motion.div 
            className="md:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProductGallery 
              productName={product.name}
              galleryItems={galleryItems}
              isLoadingGallery={isLoadingGallery}
            />
          </motion.div>

          {/* Product Info - 2 columns */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Product Features & Info */}
            <ProductInfo 
              product={product} 
              selectedVariant={selectedVariant}
              onSelectVariant={onSelectVariant}
            />
          </motion.div>
        </motion.div>

        <Separator.Root className="my-8 h-px bg-gray-200" />

        {/* Product Description Section */}
        <div className="grid grid-cols-5 gap-8">
          {/* Main Content - 3 columns */}
          <div className="col-span-3 space-y-8">
            <ProductDescription 
              keyFeatures={keyFeatures}
              benefits={
                benefits 
                  ? typeof benefits === 'object' && !Array.isArray(benefits) && 'benefits' in benefits
                    ? { bullets: benefits.benefits }
                    : Array.isArray(benefits)
                      ? { bullets: benefits }
                      : { bullets: [benefits as string] }
                  : undefined
              }
              instructions={instructions}
              overview={overview}
              content={product.content}
            />
            
            <motion.div 
              id="faq"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <FAQ />
            </motion.div>
            
            <motion.div 
              id="reviews"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5 }}
            >
              <ReviewsSection comments={comments} ratingSummary={ratingSummary} />
            </motion.div>
          </div>

          {/* Technical Specifications - 2 columns */}
          <motion.div 
            className="col-span-2"
            id="specs"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <TechnicalSpecs specifications={technicalSpecs} />
          </motion.div>
        </div>

        {/* Similar Products Section */}
        <div id="similar">
          <SimilarProducts products={similarProducts} loading={false} />
        </div>
      </div>
    </motion.div>
  );
} 