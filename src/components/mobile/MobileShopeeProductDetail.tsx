import { Product, Brand } from '@/types';
import Image from 'next/image';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, ChevronLeftIcon, EllipsisVerticalIcon, StarIcon, ShareIcon, CloudIcon, MinusCircleIcon, TrashIcon, ArrowPathIcon, ShieldCheckIcon, TruckIcon, WrenchScrewdriverIcon, XMarkIcon, ChevronRightIcon, PlayCircleIcon, ChevronUpIcon, ChatBubbleLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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

interface MobileProductDetailProps {
  product: Product;
}

// Hàm tạo màu ngẫu nhiên từ tên
const getRandomColor = (name: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// Hàm lấy 2 ký tự đầu của tên
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Gallery item types
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

export function MobileShopeeProductDetail({ product }: MobileProductDetailProps) {
  const { addToCart, cartItems, totalItems } = useCart();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Drawer state for "Thêm giỏ hàng"
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('Đen');
  const [quantity, setQuantity] = useState(1);
  // Add new state for brand
  const [brandInfo, setBrandInfo] = useState<Brand | null>(null);
  // Available colors - mockup data
  const colors = ['Đen', 'Xám', 'Đen Hồng'];
  // Các info phụ dùng giá trị mặc định vì không có trong Product
  const rating = product.rating || 4.1;
  const ratingCount = 394000; // mặc định
  const size = '163 MB'; // mặc định
  const age = '3+'; // mặc định
  // Use brandInfo.title if available, otherwise fall back to product.brand or default
  const publisher = brandInfo?.title || product.brand || 'G3 - TECH';
  // Tag thể loại tĩnh (vì Product không có tags)
  const tags: string[] = ['Công thái học', 'Văn phòng', 'Sức khỏe', 'Làm việc lâu dài', 'Hỗ trợ lưng'];

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

  // Mock comments data
  const comments: Comment[] = [
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

  // Mock rating summary
  const ratingSummary = {
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

  // Mock gallery images (ergonomic chair theme)
  let galleryImages = [
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  ];
  // Thêm ảnh sản phẩm vào đầu gallery nếu chưa có
  if (product.image_url && !galleryImages.includes(product.image_url)) {
    galleryImages = [product.image_url, ...galleryImages];
  }

  // Video info
  const video: GalleryVideo = {
    type: 'video',
    url: 'https://youtu.be/c2F2An3YU04?si=x4rVDMlPldHkkbYz',
    embed: 'https://www.youtube.com/embed/c2F2An3YU04',
    thumbnail: 'https://img.youtube.com/vi/c2F2An3YU04/hqdefault.jpg',
    title: 'Video giới thiệu sản phẩm G3-TECH',
  };

  // Gallery: ảnh sản phẩm đầu tiên, sau đó video, sau đó các ảnh còn lại (không trùng lặp)
  const galleryItems: GalleryItem[] = [
    ...(product.image_url ? [{ type: 'image' as const, src: product.image_url, alt: 'Ảnh sản phẩm' }] : []),
    video,
    ...galleryImages
      .filter((src) => src !== product.image_url)
      .map((src, idx) => ({ type: 'image' as const, src, alt: `Gallery image ${idx + 1}` })),
  ];

  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Handler for opening lightbox
  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  // Handler for closing lightbox
  const closeLightbox = () => setLightboxOpen(false);

  // Handler for next/prev image
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % galleryItems.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);

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
    setIsMenuOpen(false);
  };

  const handleFeedback = () => {
    // TODO: Implement feedback functionality
    console.log('Feedback clicked');
    setIsMenuOpen(false);
  };

  const handleAddToCart = () => {
    // Open drawer instead of directly adding to cart
    setIsCartDrawerOpen(true);
  };
  
  const confirmAddToCart = () => {
    // Add to cart with selected options
    const productWithOptions = {
      ...product,
      selectedOptions: {
        color: selectedColor,
        quantity: quantity
      }
    };
    
    // Add to cart multiple times based on quantity or pass the quantity to addToCart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    setIsCartDrawerOpen(false);
    
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        border: 'none',
      },
      icon: '🛒',
      iconTheme: {
        primary: '#fff',
        secondary: '#333',
      },
    });
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 99));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="md:hidden bg-white min-h-screen">
      {/* HEADER Shopee style */}
      <div className="sticky top-0 z-20 bg-[#f5f5f5] border-b border-gray-200">
        <div className="flex items-center h-14 px-2 relative">
          <button
            onClick={() => {
              if (brandInfo?.slug) {
                router.push(`/brands/${brandInfo.slug}`);
              } else if (product.brand_slug) {
                router.push(`/brands/${product.brand_slug}`);
              } else {
                router.back();
              }
            }}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <div className="absolute left-0 right-0 top-0 h-14 flex items-center justify-center pointer-events-none">
            <span className="font-bold text-lg text-red-700 tracking-wide pointer-events-none">{publisher.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2">
            <button
              onClick={() => router.push('/gio-hang')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 relative"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-gray-600"
            >
              <EllipsisVerticalIcon className="w-6 h-6" />
            </button>
          </div>
          {/* Context Menu giữ nguyên */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button onClick={handleShare} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">Chia sẻ</button>
                  <button onClick={handleFeedback} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">Góp ý</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Gallery ảnh lớn + thumbnail ngang */}
      <div className="w-full flex flex-col items-center bg-white  pb-2">
        {/* Ảnh lớn */}
        <div className="relative w-full aspect-square max-w-full overflow-hidden border border-gray-200 bg-gray-50 mb-2">
          {galleryItems[lightboxIndex].type === 'video' ? (
            <iframe
              src={galleryItems[lightboxIndex].embed + '?autoplay=1&mute=1'}
              title={galleryItems[lightboxIndex].type === 'video' ? galleryItems[lightboxIndex].title : ''}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full absolute inset-0 bg-black"
              style={{ aspectRatio: '1/1', minHeight: 200 }}
            />
          ) : (
            <>
              <Image
                src={galleryItems[lightboxIndex].src}
                alt={galleryItems[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1}/{galleryItems.length}
              </div>
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        {/* Thumbnails ngang */}
        <div className="flex gap-2 overflow-x-auto px-2 w-full justify-start">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              className={`relative w-14 h-14 rounded-lg border-2 cursor-pointer flex-shrink-0 ${lightboxIndex === idx ? 'border-red-500' : 'border-gray-200'}`}
              onClick={() => setLightboxIndex(idx)}
            >
              {item.type === 'video' ? (
                <>
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="56px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <PlayCircleIcon className="w-7 h-7 text-white" />
                  </div>
                </>
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover rounded-lg"
                  sizes="56px"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* GIÁ & PHÂN LOẠI (chỉ giữ giá, xoá tuỳ chọn màu) */}
      <div className="bg-white px-4 pt-2 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-red-600">{product.price?.toLocaleString('vi-VN')}₫</div>
            {product.original_price && (
              <div className="text-base text-gray-400 line-through">{product.original_price.toLocaleString('vi-VN')}₫</div>
            )}
          </div>
          <div className="text-xs text-gray-500">Đã bán 114</div>
        </div>
        {/* Brand display */}
        {publisher && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Thương hiệu:</span>
            <span className="text-sm font-medium text-gray-800">{publisher}</span>
          </div>
        )}
      </div>

      {/* Title sản phẩm */}
      <div className="bg-white mb-2">
        <h1 className="text-lg font-medium text-gray-900 px-4 pt-2 pb-2">{product.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2 bg-red-50 justify-start w-full px-4 py-2">
          <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Giảm giá 30%</span>
          <span className="text-gray-700">•</span>
          <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Giao hoả tốc HN HCM</span>
          <span className="text-gray-700">•</span>
          <span className="text-gray-700 font-semibold px-3 py-1 text-xs">Miễn phí vận chuyển</span>
        </div>
      </div>

      {/* Tag thể loại */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 mt-2">
          {tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium border border-red-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* THÔNG SỐ NỔI BẬT */}
      {/* Removed as per the new code block */}

      {/* Nút mua sticky dưới cùng */}
      <div className="fixed bottom-0 left-0 right-0 z-60 bg-white border-t border-gray-200 flex gap-2 shadow-lg p-3">
        <button
          className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600 rounded-xl hover:bg-gray-50 transition-colors"
          onClick={() => { console.log('Chat now:', product.id); }}
        >
          <ChatBubbleLeftIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Chat ngay</span>
        </button>
        <div className="h-8 w-px bg-gray-300 self-center"></div>
        <button
          className="flex flex-col items-center justify-center basis-1/4 h-14 text-red-600 rounded-xl hover:bg-gray-50 transition-colors"
          onClick={handleAddToCart}
        >
          <ShoppingCartIcon className="w-6 h-6" />
          <span className="text-xs mt-1">Thêm giỏ hàng</span>
        </button>
        <button
          className="flex-1 basis-2/4 bg-red-600 text-white h-14 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg flex flex-col items-center justify-center"
          onClick={() => { console.log('Buy now:', product.id); }}
        >
          <span>Mua với voucher</span>
          <span className="text-sm font-medium">{product.price?.toLocaleString('vi-VN')}₫</span>
        </button>
      </div>

      {/* Cart Drawer */}
      {isCartDrawerOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-70 transition-opacity"
            onClick={() => setIsCartDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-80 bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 ease-in-out max-h-[90vh] overflow-y-auto">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium">Thêm vào giỏ hàng</h3>
              <button 
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Product info */}
            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
              <div className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                <Image 
                  src={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                <div className="mt-1 text-red-600 font-semibold">
                  {product.price?.toLocaleString('vi-VN')}₫
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Kho: 999
                </div>
              </div>
            </div>
            
            {/* Color options */}
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-base font-medium mb-3">Màu Sắc</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm ${
                      selectedColor === color 
                        ? 'border-red-500 text-red-600 bg-red-50' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-base font-medium mb-3">Số lượng</h4>
              <div className="flex items-center w-32">
                <button 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-lg ${
                    quantity <= 1 ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 text-center">
                  {quantity}
                </div>
                <button 
                  onClick={incrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-lg text-gray-700"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="p-4">
              <button
                onClick={confirmAddToCart}
                className="w-full bg-red-600 text-white h-12 text-base font-semibold shadow hover:bg-red-700 transition-colors rounded-lg flex items-center justify-center"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mô tả sản phẩm */}
      <div className="prose max-w-none px-4 mt-2 pb-8">
        <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
        <p className="text-gray-600 text-sm whitespace-pre-line">{product.description}</p>
      </div>

      {/* Chính sách mua hàng */}
      <div className="px-4 pt-0 pb-2">
        <h2 className="text-lg font-semibold mb-2 text-red-700">Chính sách mua hàng tại G3-TECH</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex items-start gap-3">
            <ArrowPathIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">1 đổi 1 chi tiết lỗi trong 15 ngày</span>
              <div className="text-xs text-gray-500">nếu lỗi do nhà sản xuất</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Bảo hành phần cơ khí 12 tháng, lưới 6 tháng</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TruckIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Vận chuyển toàn quốc, nhận hàng kiểm tra trước khi thanh toán</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <WrenchScrewdriverIcon className="w-6 h-6 text-red-600 mt-0.5" />
            <div>
              <span className="font-medium text-gray-800">Miễn phí lắp đặt tại Hà Nội và TP. Hồ Chí Minh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Đánh giá & Bình luận */}
      <div className="px-4 pb-8">
        {/* Tổng quan điểm đánh giá */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Điểm xếp hạng và bài đánh giá</h2>
          <p className="text-gray-500 text-sm mb-4">Điểm xếp hạng và bài đánh giá đã được xác minh và do những người sử dụng cùng loại thiết bị với bạn đưa ra</p>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-4xl font-bold text-gray-900 leading-none">{ratingSummary.average.toFixed(1)}</span>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(ratingSummary.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 mt-1">{ratingSummary.total.toLocaleString()}</span>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {ratingSummary.stars.map((s, idx) => {
                const percent = (s.count / ratingSummary.total) * 100;
                return (
                  <div key={s.star} className="flex items-center gap-2">
                    <span className="text-xs w-3 text-gray-700">{s.star}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div className="h-2 rounded bg-blue-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách bình luận */}
        <div className="space-y-8">
          {[...comments].reverse().map((comment) => (
            <div key={comment.id}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-lg ${getRandomColor(comment.user.name)}`}>{getInitials(comment.user.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                    <span className="text-xs text-gray-500">{comment.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`w-4 h-4 ${i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-800 text-sm mt-2 whitespace-pre-line">{comment.content}</p>
                  <div className="mt-2 text-xs text-gray-500">{comment.likes} người thấy bài đánh giá này hữu ích</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-700">Bài đánh giá này có hữu ích không?</span>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Có</button>
                    <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100">Không</button>
                  </div>
                  {comment.publisherReply && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-gray-700">{comment.publisherReply.name}</span>
                        <span className="text-xs text-gray-400">{comment.publisherReply.date}</span>
                      </div>
                      <div className="text-gray-700 text-sm whitespace-pre-line">{comment.publisherReply.content}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 