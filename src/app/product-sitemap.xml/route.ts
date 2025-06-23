import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField } from 'next-sitemap';
import { createServerClient } from '@/lib/supabase';

interface ProductData {
  id: string;
  slug: string;
  created_at: string;
  updated_at?: string;
}

export async function GET() {
  try {
    console.log('Generating product sitemap');
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Get all active products
    const { data: products, error } = await supabase
      .from('products')
      .select(`
          id,
          slug,
          updated_at,
          created_at
      `)
      .eq('status', true);
    
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Error fetching products: ${error.message}`);
    }
    
    // Transform products into sitemap fields
    const sitemapFields: ISitemapField[] = [];
    
    if (products) {
      for (const product of products) {
          // Calculate priority based on age
          const createdAt = new Date(product.created_at);
          const now = new Date();
          const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          
          // Newer products get higher priority
          const priority = ageInDays <= 30 ? 0.9 : // Less than 30 days old
                          ageInDays <= 90 ? 0.8 : // Less than 90 days old
                          ageInDays <= 180 ? 0.7 : // Less than 180 days old
                          0.6; // Older products
          
          // Determine change frequency based on age
          const changefreq = ageInDays <= 7 ? 'daily' :
                           ageInDays <= 30 ? 'weekly' :
                           ageInDays <= 90 ? 'monthly' :
                           'yearly';
          
          sitemapFields.push({
          loc: `https://g-3.vn/san-pham/${product.slug}`,
            lastmod: product.updated_at || product.created_at,
            changefreq,
            priority,
          });
      }
    }
    
    console.log(`Generated sitemap with ${sitemapFields.length} product entries`);
    return getServerSideSitemap(sitemapFields);
    
  } catch (error) {
    console.error('Error generating product sitemap:', error);
    return new Response(
      `Error generating product sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
} 