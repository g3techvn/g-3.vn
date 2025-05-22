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
    
    // Static base URLs
    const staticSitemap: ISitemapField[] = [
      {
        loc: 'https://g-3.vn',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly' as Changefreq,
        priority: 1.0,
      },
      {
        loc: 'https://g-3.vn/about',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly' as Changefreq,
        priority: 0.8,
      }
    ];
    
    try {
      // Fetch product slugs
      console.log('Fetching products');
      const { data: products, error } = await supabase
        .from('products')
        .select('slug');
      
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        console.log(`Fetched ${products?.length || 0} products`);
        
        // Add product URLs to sitemap
        const productFields = (products || []).map((product) => ({
          loc: `https://g-3.vn/san-pham/${product.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily' as Changefreq,
          priority: 0.8,
        }));
        
        staticSitemap.push(...productFields);
      }
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