import { Product, Brand, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useBuyNow } from '@/context/BuyNowContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ImageItem } from '@/types/supabase';
import { useToast } from "@/hooks/useToast";

// Import newly created components
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import { ProductPrice } from './ProductPrice';
import { ProductInfo } from './ProductInfo';
import { ProductDescription } from './ProductDescription';
import { ProductPolicies } from './ProductPolicies';
import { ProductReviews } from './ProductReviews';
import { ProductActions } from './ProductActions';
import { ProductCartSheet } from './ProductCartSheet';
import { TechnicalSpecs } from './TechnicalSpecs';
import { ProductFeatures } from './ProductFeatures';
import { ProductVariants } from './ProductVariants';

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

export interface MobileProductDetailProps {
  product: Product;
  galleryImages: string[];
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
  technicalSpecs: { name: string; value: string; }[];
  keyFeatures: string[];
  benefits: string[];
  instructions: string[];
  overview: string;
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

// Gallery item types - match ProductGallery interface
type GalleryVideo = {
  type: 'video';
  url: string;
  embed: string;
  thumbnail: string;
  title: string;
};
type GalleryImage = {
  type: 'image';
  url: string;
  alt?: string;
};
type GalleryItem = GalleryVideo | GalleryImage;

export function MobileShopeeProductDetail({ product, galleryImages = [], videoInfo, comments = [], ratingSummary, technicalSpecs = [], keyFeatures, benefits, instructions, overview, selectedVariant, onSelectVariant }: MobileProductDetailProps) {
  const { addToCart, cartItems, totalItems } = useCart();
  const { setBuyNowItem } = useBuyNow();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Cart drawer state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  
  // Brand state
  const [brandInfo, setBrandInfo] = useState<Brand | null>(null);
  
  // Gallery state
  const [localGalleryImages, setLocalGalleryImages] = useState<string[]>(galleryImages);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  
  // Tag thể loại tĩnh (vì Product không có tags)
  const tags: string[] = ['Công thái học', 'Văn phòng', 'Sức khỏe', 'Làm việc lâu dài', 'Hỗ trợ lưng'];

  // Use brandInfo.title if available, otherwise fall back to product.brand or default
  const publisher = brandInfo?.title || (typeof product.brand === 'string' ? product.brand : product.brand?.title) || 'G3 - TECH';
  const brandSlug = brandInfo?.slug || product.brand_slug;

  // Add useEffect to fetch brand details
  useEffect(() => {
    const fetchBrandInfo = async () => {
      if (product.brand_id) {
        try {
          const response = await fetch(`/api/brands/id/${product.brand_id}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data.brand) {
            setBrandInfo(data.brand);
          }
        } catch (error) {
          console.error('Error fetching brand info:', error);
        }
      }
    };
    
    fetchBrandInfo();
  }, [product.brand_id]);

  // Fetch gallery images only if not provided as props
  useEffect(() => {
    // If gallery images are provided as props, use them
    if (galleryImages.length > 0) {
      setLocalGalleryImages(galleryImages);
      return;
    }
    
    // Otherwise fetch them
    const fetchGalleryImages = async () => {
      if (!product.gallery_url) {
        setLocalGalleryImages([]);
        return;
      }

      try {
        setIsLoadingGallery(true);
        const response = await fetch(`/api/images?folder=${encodeURIComponent(product.gallery_url)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const imageUrls = data.images.map((img: ImageItem) => img.url);
          setLocalGalleryImages(imageUrls);
        } else {
          setLocalGalleryImages([]);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setLocalGalleryImages([]);
      } finally {
        setIsLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, [product.gallery_url, galleryImages]);

  // Use provided rating summary or default to mock data
  const defaultRatingSummary = {
    average: product.rating || 4.1,
    total: 394168,
    stars: [
      { star: 5, count: 300000 },
      { star: 4, count: 60000 },
      { star: 3, count: 20000 },
      { star: 2, count: 8000 },
      { star: 1, count: 6200 },
    ]
  };

  // Use provided rating summary or fall back to default
  const currentRatingSummary = ratingSummary || defaultRatingSummary;

  // Mock comments data - now only used as fallback if none provided
  const defaultComments: Comment[] = [
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
    },
    {
      id: '3',
      user: { name: 'Minh Hằng' },
      rating: 5,
      content: 'Mình rất thích thiết kế của ghế, hiện đại và chắc chắn. Giao hàng nhanh, đóng gói cẩn thận. Sẽ giới thiệu cho bạn bè!',
      date: '2/6/2025',
      likes: 41
    }
  ];

  // Use provided comments or fall back to default
  const currentComments = comments.length > 0 ? comments : defaultComments;

  // Video info - use videoInfo prop or fallback to default
  const video: GalleryVideo | null = videoInfo?.videoUrl && videoInfo?.thumbnail ? {
    type: 'video',
    url: product.video_url || '',
    embed: videoInfo.videoUrl,
    thumbnail: videoInfo.thumbnail,
    title: 'Video giới thiệu sản phẩm G3-TECH',
  } : null;

  // Gallery: ảnh sản phẩm đầu tiên, sau đó video, sau đó các ảnh từ Supabase
  const galleryItems: GalleryItem[] = [
    ...(product.image_url ? [{ type: 'image' as const, url: product.image_url, alt: 'Ảnh sản phẩm' }] : []),
    ...(video ? [video] : []),
    ...localGalleryImages
      .filter((src) => src !== product.image_url)
      .map((src, idx) => ({ type: 'image' as const, url: src, alt: `Gallery image ${idx + 1}` })),
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link vào clipboard!');
    }
  };

  const handleFeedback = () => {
    // TODO: Implement feedback functionality
    console.log('Feedback clicked');
  };

  const handleAddToCart = () => {
    // If product has no variants, add directly to cart
    if (!product.variants || product.variants.length === 0) {
      const cartItem = {
        productId: product.id,
        quantity: 1,
        product: {
          ...product,
          variants: []
        }
      };
      addToCart(cartItem);
      showToast('Đã thêm vào giỏ hàng', 'default');
    } else {
      // If product has variants, open cart drawer to select variant
      setIsCartDrawerOpen(true);
    }
  };

  const confirmAddToCart = async (product: Product, quantity: number, selectedVariant?: ProductVariant | null) => {
    try {
      const cartItem = {
        productId: product.id,
        quantity,
        product: {
          ...product,
          variants: selectedVariant ? [selectedVariant] : []
        }
      };
      await addToCart(cartItem);
      showToast('Đã thêm vào giỏ hàng', 'default');
      setIsCartDrawerOpen(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Không thể thêm vào giỏ hàng', 'destructive');
    }
  };

  const handleBuyNow = () => {
    // If product has no variants, proceed to buy now
    if (!product.variants || product.variants.length === 0) {
      const buyNowItem = {
        productId: product.id,
        quantity: 1,
        product: {
          ...product,
          variants: []
        }
      };
      setBuyNowItem(buyNowItem);
      router.push('/mua-ngay');
    } else {
      // If product has variants, open cart drawer to select variant
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <div className="md:hidden bg-white min-h-screen pb-24">
      {/* Header */}
      <ProductHeader 
        publisher={publisher}
        brandSlug={brandSlug}
        totalCartItems={totalItems}
        onShareClick={handleShare}
        onFeedbackClick={handleFeedback}
      />

      {/* Gallery */}
      <ProductGallery 
        productName={product.name}
        galleryItems={galleryItems}
        isLoadingGallery={isLoadingGallery}
      />

      {/* Price */}
      <ProductPrice 
        price={product.price}
        originalPrice={product.original_price}
        publisher={publisher}
        selectedVariant={selectedVariant}
        productId={product.id.toString()}
      />

      {/* Product Info */}
      <ProductInfo 
        product={product}
        selectedVariant={selectedVariant}
      />

      {/* Product Variants */}
      <ProductVariants 
        variants={product.variants || []}
        selectedVariant={selectedVariant}
        onSelectVariant={onSelectVariant}
      />

      {/* Description */}
      <div>
        {/* Product Description */}
        <ProductDescription 
          keyFeatures={keyFeatures}
          benefits={benefits}
          instructions={instructions}
          overview={product.description || overview}
          content={product.content}
        />
        
        {/* Product Features */}
        <ProductFeatures 
          keyFeatures={keyFeatures}
          benefits={benefits}
          instructions={instructions}
        />
        
        {/* Technical Specifications */}
        <TechnicalSpecs specifications={technicalSpecs} />
        
        {/* Product Policies */}
        <ProductPolicies />
        
        {/* Product Reviews */}
        <ProductReviews
          comments={currentComments}
          ratingSummary={currentRatingSummary}
        />
      </div>

      {/* Bottom Actions */}
      <ProductActions
        productPrice={product.price}
        selectedVariant={selectedVariant}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Cart Sheet */}
      <ProductCartSheet
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
        onAddToCart={confirmAddToCart}
      />
    </div>
  );
} 