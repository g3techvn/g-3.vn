import { getServerSideSitemap } from 'next-sitemap';
import type { ISitemapField } from 'next-sitemap';
import { createServerClient } from '@/lib/supabase';

interface ProductData {
  id: string;
  slug: string;
  updated_at: string | null;
  created_at: string;
}

interface ProductSectorData {
  product_id: string;
  products: ProductData;
}

export async function GET() {
  try {
    // Get domain from environment variable
    const g3Domain = process.env.NEXT_PUBLIC_G3_URL || 'g-3.vn';
    console.log('Generating product sitemap for domain:', g3Domain);
    
    // Initialize Supabase client
    const supabase = createServerClient();
    
    // Get sector ID for this domain
    const { data: sectors, error: sectorError } = await supabase
      .from('sectors')
      .select('id')
      .eq('title', g3Domain)
      .limit(1);
    
    if (sectorError) {
      console.error('Error fetching sector:', sectorError);
      throw new Error(`Error fetching sector: ${sectorError.message}`);
    }
    
    if (!sectors || sectors.length === 0) {
      console.log('No sector found for domain:', g3Domain);
      return getServerSideSitemap([]);
    }
    
    const sectorId = sectors[0].id;
    
    // Get all products for this sector
    const { data: productSectors, error: productSectorError } = await supabase
      .from('product_sectors')
      .select(`
        product_id,
        products:product_id (
          id,
          slug,
          updated_at,
          created_at
        )
      `)
      .eq('sector_id', sectorId);
    
    if (productSectorError) {
      console.error('Error fetching products:', productSectorError);
      throw new Error(`Error fetching products: ${productSectorError.message}`);
    }
    
    // Transform products into sitemap fields
    const sitemapFields: ISitemapField[] = [];
    
    if (productSectors) {
      for (const item of productSectors) {
        // Type guard to ensure products has the required fields
        if (item.products && 
            typeof item.products === 'object' && 
            'slug' in item.products &&
            'created_at' in item.products) {
          const product = item.products as unknown as ProductData;
          
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
            loc: `https://${g3Domain}/san-pham/${product.slug}`,
            lastmod: product.updated_at || product.created_at,
            changefreq,
            priority,
          });
        }
      }
    }
    
    console.log(`Generated sitemap with ${sitemapFields.length} product entries for domain:`, g3Domain);
    return getServerSideSitemap(sitemapFields);
    
  } catch (error) {
    console.error('Error generating product sitemap:', error);
    return new Response(
      `Error generating product sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
} 