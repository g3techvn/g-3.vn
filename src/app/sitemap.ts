import { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = COMPANY_INFO.website;
  
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/san-pham`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/uu-dai`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Policy pages
    {
      url: `${baseUrl}/noi-dung/chinh-sach-bao-hanh-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/noi-dung/chinh-sach-bao-mat-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/noi-dung/chinh-sach-doi-tra-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/noi-dung/chinh-sach-thanh-toan-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/noi-dung/chinh-sach-van-chuyen-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/noi-dung/chinh-sach-kiem-hang-g3`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch products without caching
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    
    let productRoutes: MetadataRoute.Sitemap = [];
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      const products = productsData.products || [];
      
      productRoutes = products.map((product: Record<string, unknown>) => ({
        url: `${baseUrl}/san-pham/${product.slug || product.id}`,
        lastModified: new Date((product.updated_at || product.created_at) as string),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    // Fetch categories without caching
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    
    let categoryRoutes: MetadataRoute.Sitemap = [];
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.categories || [];
      
      categoryRoutes = categories.map((category: Record<string, unknown>) => ({
        url: `${baseUrl}/categories/${category.slug || category.id}`,
        lastModified: new Date((category.updated_at || category.created_at) as string),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

    // Fetch brands without caching
    const brandsResponse = await fetch(`${baseUrl}/api/brands`);
    
    let brandRoutes: MetadataRoute.Sitemap = [];
    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json();
      const brands = brandsData.brands || [];
      
      brandRoutes = brands.map((brand: Record<string, unknown>) => ({
        url: `${baseUrl}/brands/${brand.slug || brand.id}`,
        lastModified: new Date((brand.updated_at || brand.created_at) as string),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

    return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...brandRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static routes only if API calls fail
    return staticRoutes;
  }
} 