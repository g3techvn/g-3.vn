import Image from 'next/image';

interface Promotion {
  id: number;
  created_at: string;
  title: string;
  desc: string;
  image: string;
  youtube_url?: string;
  slug: string;
}

function getTimeAgo(dateString: string) {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

interface MobilePromotionFeedProps {
  promotions: Promotion[];
  isLoading: boolean;
  error: string | null;
  expandedDescriptions: Record<number, boolean>;
  toggleDescription: (id: number) => void;
}

export default function MobilePromotionFeed({
  promotions,
  isLoading,
  error,
  expandedDescriptions,
  toggleDescription,
}: MobilePromotionFeedProps) {
  return (
    <div className="container mx-auto">
      {isLoading && <p className="text-center">Đang tải khuyến mãi...</p>}
      {error && <p className="text-red-500 text-center">Lỗi: {error}</p>}
      {!isLoading && !error && promotions.length === 0 && <p className="text-center">Không có khuyến mãi nào.</p>}
      {!isLoading && !error && promotions.length > 0 && (
        <div className="flex flex-col items-center space-y-1 bg-gray-200">
          {promotions.map((promo) => (
            <div key={promo.id} className="w-full bg-white flex flex-col items-center  overflow-hidden max-w-lg mx-auto border border-gray-200">
              {/* Facebook-style Header */}
              <div className="flex items-center justify-between w-full p-4 pb-2">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/images/g3-avatar.jpg"
                    alt="avatar"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">G3 - Công Thái Học</div>
                    <div className="text-xs text-gray-500 ">{getTimeAgo(promo.created_at)} · <span className="inline-block align-middle">🌐</span></div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 text-xl rotate-90">⋯</button>
              </div>

              {/* Description Section */}
              <div className="w-full px-4 pb-2">
                <p className="text-left text-gray-800 text-[15px] leading-snug">
                  {expandedDescriptions[promo.id] ? promo.desc : `${promo.desc.substring(0, 100)}${promo.desc.length > 100 ? '...' : ''}`}
                  {promo.desc.length > 100 && (
                    <button 
                      onClick={() => toggleDescription(promo.id)} 
                      className="text-blue-600 hover:underline ml-1 font-medium text-sm"
                    >
                      {expandedDescriptions[promo.id] ? 'Ẩn bớt' : 'Xem thêm'}
                    </button>
                  )}
                </p>
              </div>

              {/* Image/Video Section */}
              <div className="relative w-full flex justify-center items-center min-h-[300px]">
                {promo.image && (
                  <>
                    {/* Blurred background image */}
                    <div
                      className="absolute inset-0 w-full h-full z-0"
                      style={{
                        backgroundImage: `url(${promo.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/30"></div>
                    </div>
                    {/* Main image */}
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      width={800}
                      height={600}
                      className="relative z-10 w-full h-auto object-contain max-h-[600px] "
                    />
                  </>
                )}
                {promo.youtube_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <iframe
                      width="100%"
                      height="300"
                      src={promo.youtube_url.replace('watch?v=', 'embed/')}
                      title={promo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded"
                    ></iframe>
                  </div>
                )}
              </div>

              {/* Interaction Info */}
              <div className="w-full px-4 pt-2 pb-1 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">👍</span>
                  <span>7.163</span>
                </div>
                <div>
                  <span>1,8K bình luận</span> · <span>389 lượt chia sẻ</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full border-t border-gray-100 flex justify-around py-1">
                <button className="flex items-center space-x-2 py-2 px-4 rounded hover:bg-gray-100 w-1/3 justify-center">
                  <span className="text-lg">👍</span>
                  <span className="text-sm font-medium">Thích</span>
                </button>
                <button className="flex items-center space-x-2 py-2 px-4 rounded hover:bg-gray-100 w-1/3 justify-center">
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-medium">Bình luận</span>
                </button>
                <button className="flex items-center space-x-2 py-2 px-4 rounded hover:bg-gray-100 w-1/3 justify-center">
                  <span className="text-lg">↗️</span>
                  <span className="text-sm font-medium">Chia sẻ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 