import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase';

// Define a type-safe generateMetadata helper function
function getMetadata({
  title,
  description,
  image,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}): Metadata {
  const baseUrl = 'https://g-3.vn';
  
  return {
    title: title ? title : 'G3 - Công Thái Học',
    description: description || 'Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao',
    openGraph: {
      title: title || 'G3 - Công Thái Học',
      description: description || 'Cung cấp sản phẩm nội thất văn phòng với thiết kế công thái học chất lượng cao',
      images: [
        {
          url: image?.startsWith('http') ? image : `${baseUrl}${image || '/logo.png'}`,
          width: 800,
          height: 600,
          alt: title || 'G3 Image',
        },
      ],
      url: url?.startsWith('http') ? url : `${baseUrl}${url || ''}`,
    },
    alternates: {
      canonical: url?.startsWith('http') ? url : `${baseUrl}${url || ''}`,
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const supabase = createServerClient();
    
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (!product) {
      return getMetadata({
        title: 'Sản phẩm không tồn tại',
        description: 'Sản phẩm này không tồn tại trong hệ thống của chúng tôi.',
        url: `/san-pham/${slug}`
      });
    }
    
    // Get the first product image or default image
    const imageUrl = product.main_image || '/placeholder-product.jpg';
    
    return getMetadata({
      title: product.name,
      description: product.short_description || `${product.name} - Sản phẩm công thái học chất lượng cao từ G3`,
      image: imageUrl,
      url: `/san-pham/${slug}`
    });
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return getMetadata({
      title: 'Sản phẩm - G3',
      description: 'Khám phá các sản phẩm công thái học chất lượng cao tại G3',
      url: `/san-pham/${slug}`
    });
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 