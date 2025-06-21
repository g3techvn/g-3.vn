import React from 'react';
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
    stars: { star: number; count: number; }[];
  };
  similarProducts: Product[];
  loadingSimilar: boolean;
  technicalSpecs: Array<{ title: string; value: string; }>;
  keyFeatures: string[];
  benefits: Benefits;
  instructions: string[];
  overview: string;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

// Lazy load non-critical components
const TechnicalSpecs = dynamic(() => import('./TechnicalSpecs').then(mod => ({ default: mod.TechnicalSpecs })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  ),
  ssr: false // Performance: Disable SSR for below-fold content
});

const FAQ = dynamic(() => import('./FAQ').then(mod => ({ default: mod.FAQ })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
});

const ReviewsSection = dynamic(() => import('./ReviewsSection').then(mod => ({ default: mod.ReviewsSection })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex gap-6">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="flex-1 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-4 bg-gray-200 rounded"></div>
                <div className="h-2 flex-1 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
});

const SimilarProducts = dynamic(() => import('./SimilarProducts').then(mod => ({ default: mod.SimilarProducts })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false
});

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
            <div className="space-y-6">
              {/* Product Name */}
              <h1 className="text-3xl font-bold">{product.name}</h1>

              {/* Price Section */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(currentPrice)}
                </span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              
              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <ProductVariants
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelectVariant={onSelectVariant}
                />
              )}

              {/* Product Features & Info */}
              <ProductInfo product={product} selectedVariant={selectedVariant} />
            </div>
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
          <SimilarProducts products={similarProducts} loading={loadingSimilar} />
        </div>
      </div>
    </motion.div>
  );
} 