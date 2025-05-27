import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField } from 'next-sitemap';
import { createServerClient } from '@/lib/supabase';

// Define Changefreq type to match next-sitemap's expectations
type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export async function GET() {
  try {
    console.log('Starting sitemap generation');
    const supabase = createServerClient();
    console.log('Supabase client created');
    
    // Static base URLs with improved structure and more pages
    const staticSitemap: ISitemapField[] = [
      {
        loc: 'https://g-3.vn',
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as Changefreq,
        priority: 1.0,
      },
      {
        loc: 'https://g-3.vn/san-pham',
        lastmod: new Date().toISOString(),
        changefreq: 'hourly' as Changefreq,
        priority: 0.9,
      },
      {
        loc: 'https://g-3.vn/about',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly' as Changefreq,
        priority: 0.7,
      },
      {
        loc: 'https://g-3.vn/lien-he',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly' as Changefreq,
        priority: 0.7,
      },
      {
        loc: 'https://g-3.vn/uu-dai',
        lastmod: new Date().toISOString(),
        changefreq: 'daily' as Changefreq,
        priority: 0.8,
      },
      {
        loc: 'https://g-3.vn/video',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as Changefreq,
        priority: 0.6,
      }
    ];

    try {
      // Fetch categories
      console.log('Fetching categories');
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('slug, updated_at');

      if (categoryError) {
        console.error('Error fetching categories:', categoryError);
      } else {
        console.log(`Fetched ${categories?.length || 0} categories`);
        
        // Add category URLs to sitemap
        const categoryFields = (categories || []).map((category) => ({
          loc: `https://g-3.vn/categories/${category.slug}`,
          lastmod: category.updated_at || new Date().toISOString(),
          changefreq: 'daily' as Changefreq,
          priority: 0.8,
        }));
        
        staticSitemap.push(...categoryFields);
      }

      // Fetch brands
      console.log('Fetching brands');
      const { data: brands, error: brandError } = await supabase
        .from('brands')
        .select('slug, updated_at');

      if (brandError) {
        console.error('Error fetching brands:', brandError);
      } else {
        console.log(`Fetched ${brands?.length || 0} brands`);
        
        // Add brand URLs to sitemap
        const brandFields = (brands || []).map((brand) => ({
          loc: `https://g-3.vn/brands/${brand.slug}`,
          lastmod: brand.updated_at || new Date().toISOString(),
          changefreq: 'weekly' as Changefreq,
          priority: 0.7,
        }));
        
        staticSitemap.push(...brandFields);
      }

      // Fetch products with more details
      console.log('Fetching products');
      const { data: products, error: productError } = await supabase
        .from('products')
        .select('slug, updated_at, created_at');
      
      if (productError) {
        console.error('Error fetching products:', productError);
      } else {
        console.log(`Fetched ${products?.length || 0} products`);
        
        // Add product URLs to sitemap with dynamic priorities based on age
        const productFields = (products || []).map((product) => {
          const createdAt = new Date(product.created_at);
          const now = new Date();
          const productAge = now.getTime() - createdAt.getTime();
          const isNewProduct = productAge < 7 * 24 * 60 * 60 * 1000; // 7 days

          return {
            loc: `https://g-3.vn/san-pham/${product.slug}`,
            lastmod: product.updated_at || new Date().toISOString(),
            // Newer products get more frequent updates
            changefreq: isNewProduct ? 'hourly' as Changefreq : 'daily' as Changefreq,
            // Newer products get higher priority
            priority: isNewProduct ? 0.9 : 0.8,
          };
        });
        
        staticSitemap.push(...productFields);
      }

      // Add policy pages
      const policyPages = [
        'chinh-sach-bao-mat',
        'chinh-sach-bao-hanh',
        'chinh-sach-doi-tra',
        'chinh-sach-van-chuyen',
        'chinh-sach-thanh-toan',
        'chinh-sach-kiem-hang'
      ].map(slug => ({
        loc: `https://g-3.vn/noi-dung/${slug}-g3`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly' as Changefreq,
        priority: 0.5,
      }));

      staticSitemap.push(...policyPages);

    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    console.log(`Generated sitemap with ${staticSitemap.length} entries`);
    return getServerSideSitemap(staticSitemap);
  } catch (error) {
    console.error('Error generating server sitemap:', error);
    return new Response(`Error generating sitemap: ${error instanceof Error ? error.message : String(error)}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
} 