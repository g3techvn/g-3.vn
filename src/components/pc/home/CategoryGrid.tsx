import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { CameraIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDomain } from '@/context/domain-context';

type Category = {
  name: string;
  slug: string;
  image_url: string;
};

type ApiCategory = {
  title: string;
  slug: string;
  image_url?: string;
};

type CategoryGridProps = {
  categories?: Category[];
};

// Helper component to handle fallback for Next.js Image
function CategoryImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={56}
      height={56}
      className="object-cover w-full h-full"
      onError={() => setImgSrc('/images/categories/default.jpg')}
    />
  );
}

export default function CategoryGrid({ categories: propCategories }: CategoryGridProps) {
  const { sectorId } = useDomain();
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [loading, setLoading] = useState(!propCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propCategories) return; // Nếu có props thì không fetch

    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Include the sector_id in the API request if available
        const url = new URL('/api/categories', window.location.origin);
        if (sectorId) {
          url.searchParams.append('sector_id', sectorId);
        }
        
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Lỗi khi tải danh mục');
        const data = await res.json();
        // Giả sử API trả về data.product_cats với trường title, slug, image
        const mapped = (data.product_cats || []).map((cat: ApiCategory) => ({
          name: cat.title,
          slug: cat.slug,
          image_url: cat.image_url || '/images/categories/default.jpg', // fallback nếu không có ảnh
        }));
        setCategories(mapped);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Lỗi không xác định');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [propCategories, sectorId]);

  if (loading) {
    return (
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto text-red-600">{error}</div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-100">
      <div className="container mx-auto">
        {(() => {
          const colCount = Math.min(categories.length, 5);
          const gridColsClass = `grid-cols-${colCount}`;
          return (
            <div className={`grid ${gridColsClass} gap-4`}>
              {categories.map((category, index) => (
                <Link 
                  key={index} 
                  href={`/categories/${category.slug}`} 
                  className="group"
                >
                  <Card className="h-full bg-gray-300 hover:bg-gray-200">
                    <CardContent className="flex-row items-center  w-full p-4 min-w-0">
                      <div className="flex-1 text-left">
                        <h3 className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors leading-tight truncate whitespace-nowrap">
                          {category.name}
                        </h3>
                      </div>
                      <div className="w-14 h-14 md:w-18 md:h-18 rounded-full shadow-sm  bg-white  flex-shrink-0 flex items-center justify-center ml-3 overflow-hidden">
                        <CategoryImage
                          src={category.image_url}
                          alt={category.name}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );
} 