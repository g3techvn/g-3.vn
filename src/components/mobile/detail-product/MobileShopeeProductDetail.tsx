import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/types';
import { CartItem } from '@/types/cart';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// Import all components directly
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import ProductPrice from './ProductPrice';
import { ProductInfo } from './ProductInfo';
import { ProductDescription } from './ProductDescription';
import { ProductPolicies } from './ProductPolicies';
import { ProductActions } from './ProductActions';
import { ProductCartSheet } from './ProductCartSheet';
import { ProductVariants } from './ProductVariants';
import { ProductReviews } from './ProductReviews';
import { TechnicalSpecs } from './TechnicalSpecs';
import { ProductFeatures } from './ProductFeatures';

// Import gallery types
type GalleryVideo = {
  type: 'video';
  url: string;
  embed: string;
  thumbnail: string;
  title: string;
};

type GalleryImage = {
  type: 'image';
  src: string;
  alt: string;
};

type GalleryItem = GalleryVideo | GalleryImage;

// Mock data interfaces
interface Comment {
  id: string;
  user: { name: string };
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

interface RatingSummary {
  average: number;
  total: number;
  stars: { star: number; count: number }[];
}

export default function MobileShopeeProductDetail({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Mock data
  const mockComments: Comment[] = [
    {
      id: '1',
      user: { name: 'Tám Phạm' },
      rating: 5,
      content: 'Ghế công thái học này thực sự rất thoải mái, ngồi làm việc lâu không bị đau lưng. Chất liệu tốt, lắp ráp dễ dàng. Rất đáng tiền!',
      date: '26/4/2025',
      likes: 156,
      publisherReply: {
        name: 'G3-TECH',
        date: '26/4/2025',
        content: 'Cảm ơn bạn đã tin tưởng và lựa chọn ghế công thái học của G3-TECH. Chúng tôi rất vui khi sản phẩm giúp bạn làm việc thoải mái hơn. Nếu cần hỗ trợ thêm, bạn cứ liên hệ với chúng tôi nhé!'
      }
    },
    {
      id: '2',
      user: { name: 'Anh Trương' },
      rating: 4,
      content: 'Ghế ngồi êm, tựa lưng tốt nhưng phần kê tay hơi thấp so với mình. Mong shop có thêm phụ kiện nâng kê tay.',
      date: '11/5/2025',
      likes: 23
    }
  ];

  const mockRatingSummary: RatingSummary = {
    average: 4.1,
    total: 394168,
    stars: [
      { star: 5, count: 300000 },
      { star: 4, count: 60000 },
      { star: 3, count: 20000 },
      { star: 2, count: 8000 },
      { star: 1, count: 6200 },
    ]
  };

  // Create gallery items
  const galleryItems: GalleryItem[] = [
    {
      type: 'image',
      src: product.image_url || '/placeholder-product.jpg',
      alt: product.name
    },
    ...galleryImages.map((img, idx): GalleryImage => ({
      type: 'image',
      src: img,
      alt: `${product.name} - Ảnh ${idx + 2}`
    }))
  ];

  // Add video if available
  if (product.video_url) {
    const getYouTubeId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getYouTubeId(product.video_url);
    if (videoId) {
      const videoItem: GalleryVideo = {
        type: 'video',
        url: product.video_url,
        embed: `https://www.youtube.com/embed/${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        title: product.name
      };
      galleryItems.unshift(videoItem);
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      showToast('Vui lòng chọn phân loại sản phẩm!', 'destructive');
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      quantity: quantity,
      product: selectedVariant 
        ? { ...product, variants: [selectedVariant] }
        : product
    };
    
    addToCart(cartItem);
    showToast('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/gio-hang');
  };

  // Fetch gallery images
  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (!product?.gallery_url) {
        setGalleryImages([]);
        return;
      }

      try {
        setIsLoadingGallery(true);
        const response = await fetch(`/api/images?folder=${encodeURIComponent(product.gallery_url)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const imageUrls = data.images.map((img: any) => img.url);
          setGalleryImages(imageUrls);
        } else {
          setGalleryImages([]);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setGalleryImages([]);
      } finally {
        setIsLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, [product]);

  return (
    <div className="bg-white min-h-screen">
      {/* Product Header */}
      <ProductHeader 
        publisher={typeof product.brand === 'string' ? product.brand : product.brand?.title || 'G3'}
        brandSlug={typeof product.brand === 'object' ? product.brand?.slug : undefined}
        brandImageUrl={typeof product.brand === 'object' ? product.brand?.image_url : undefined}
        totalCartItems={0} // TODO: Get from cart context
        onShareClick={() => {
          if (navigator.share) {
            navigator.share({
              title: product.name,
              text: product.description,
              url: window.location.href,
            });
          }
        }}
        onFeedbackClick={() => {
          // TODO: Implement feedback
        }}
      />

      {/* Product Gallery */}
      <ProductGallery 
        galleryItems={galleryItems}
        isLoading={isLoadingGallery}
      />

      {/* Product Info */}
      <ProductInfo 
        name={product.name}
        tags={[]}
      />

      {/* Product Price */}
      <ProductPrice 
        price={product.price}
        originalPrice={product.original_price}
        publisher={typeof product.brand === 'string' ? product.brand : product.brand?.title}
        soldCount={product.sold_count}
        selectedVariant={selectedVariant}
        productId={product.id}
      />

      {/* Product Variants */}
      {product.variants && product.variants.length > 0 && (
        <ProductVariants 
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
        />
      )}

      {/* Product Description */}
      <ProductDescription description={product.description} />

      {/* Technical Specs */}
      <TechnicalSpecs specifications={[]} />

      {/* Product Features */}
      <ProductFeatures 
        keyFeatures={[]}
        benefits={[]}
        instructions={[]}
      />

      {/* Product Policies */}
      <ProductPolicies />

      {/* Product Reviews */}
      <ProductReviews 
        comments={mockComments}
        ratingSummary={mockRatingSummary}
      />

      {/* Bottom spacing for fixed actions */}
      <div className="h-20"></div>

      {/* Product Actions - Fixed bottom */}
      <ProductActions 
        productPrice={product.price}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Product Cart Sheet */}
      <ProductCartSheet 
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
} 