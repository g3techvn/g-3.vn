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

type BlogPostsProps = {
  posts: BlogPost[];
};

export default function BlogPosts({ posts }: BlogPostsProps) {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Hướng dẫn và đánh giá</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
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