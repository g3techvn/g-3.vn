import Link from 'next/link';
import Image from 'next/image';
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
    title: "Cách chọn ghế công thái học phù hợp với văn phòng",
    date: "2024-03-20",
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=800&auto=format&fit=crop",
    excerpt: "Hướng dẫn chi tiết cách lựa chọn ghế công thái học phù hợp với nhu cầu làm việc và tư thế ngồi của bạn."
  },
  {
    id: 2,
    title: "Lợi ích của ghế công thái học đối với sức khỏe",
    date: "2024-03-18",
    image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop",
    excerpt: "Tìm hiểu về những lợi ích tuyệt vời của ghế công thái học trong việc bảo vệ sức khỏe và tăng hiệu suất làm việc."
  },
  {
    id: 3,
    title: "Top 5 ghế công thái học tốt nhất cho dân văn phòng",
    date: "2024-03-15",
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop",
    excerpt: "Đánh giá chi tiết 5 mẫu ghế công thái học được ưa chuộng nhất dành cho dân văn phòng hiện nay."
  },
  {
    id: 4,
    title: "Cách điều chỉnh ghế công thái học đúng chuẩn",
    date: "2024-03-12",
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800&auto=format&fit=crop",
    excerpt: "Hướng dẫn chi tiết cách điều chỉnh các bộ phận của ghế công thái học để đạt tư thế ngồi tối ưu."
  }
];

export default function BlogPosts() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Hướng dẫn và đánh giá</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {samplePosts.map((post) => (
            <div key={post.id} className="group">
              <Card>
                <CardHeader>
                  <AspectRatio ratio={1} className="bg-gray-200 relative">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 