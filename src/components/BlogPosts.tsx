import Link from 'next/link';
import { Card, CardHeader, CardContent, CardBadge } from '@/components/ui/Card';
import { AspectRatio } from '@/components/ui/AspectRatio';

type BlogPost = {
  id: number;
  title: string;
  date: string;
  image: string;
  excerpt?: string;
};

const samplePosts: BlogPost[] = [
  {
    id: 1,
    title: "Hướng dẫn sử dụng máy giặt Samsung hiệu quả",
    date: "2024-03-20",
    image: "/images/blog/washing-machine.jpg",
    excerpt: "Khám phá các tính năng và cách sử dụng máy giặt Samsung một cách hiệu quả nhất cho gia đình bạn."
  },
  {
    id: 2,
    title: "Đánh giá tủ lạnh Panasonic Inverter",
    date: "2024-03-18",
    image: "/images/blog/refrigerator.jpg",
    excerpt: "Tìm hiểu về công nghệ Inverter và hiệu suất tiết kiệm điện của tủ lạnh Panasonic."
  },
  {
    id: 3,
    title: "Cách chọn điều hòa phù hợp với không gian",
    date: "2024-03-15",
    image: "/images/blog/air-conditioner.jpg",
    excerpt: "Hướng dẫn chi tiết cách tính công suất và chọn điều hòa phù hợp với diện tích phòng."
  },
  {
    id: 4,
    title: "Bảo trì và vệ sinh máy lọc nước đúng cách",
    date: "2024-03-12",
    image: "/images/blog/water-purifier.jpg",
    excerpt: "Các bước bảo trì và vệ sinh máy lọc nước để đảm bảo chất lượng nước và tuổi thọ máy."
  }
];

export default function BlogPosts() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Hướng dẫn và đánh giá</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {samplePosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group">
              <Card>
                <CardHeader>
                  <AspectRatio ratio={16 / 9} className="bg-gray-200 relative">
                    {/* Replace with actual blog post images */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8a2 2 0 00-2-2h-1M8 18h12M8 14h12M8 10h4" />
                      </svg>
                    </div>
                    
                    {/* Overlay logo (small logo in top corner) */}
                    <CardBadge className="bg-white/80 text-gray-900">
                      METRO
                    </CardBadge>
                  </AspectRatio>
                </CardHeader>
                
                <CardContent>
                  <h3 className="text-base font-bold text-gray-800 mb-3 uppercase group-hover:text-red-600 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {post.excerpt ? (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {post.title} là một trong những sản phẩm chất lượng cao được người dùng đánh giá tốt. Xem chi tiết và hướng dẫn sử dụng...
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 