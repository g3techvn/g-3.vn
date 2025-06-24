import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ProductVariant } from '@/types';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // Fetch featured products with variants
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        brands:brand_id (
          title
        ),
        variants:product_variants(
          id,
          product_id,
          color,
          size,
          weight,
          price,
          original_price,
          image_url,
          gallery_url,
          sku,
          stock_quantity,
          is_default,
          created_at,
          is_dropship,
          gac_chan
        )
      `)
      .eq('status', true)
      .eq('feature', true)
      .eq('brand_id', 1) // G3 brand
      .eq('pd_cat_id', 1) // Main category
      .limit(8);

    if (error) {
      throw error;
    }

    // Convert products to combo format
    const comboProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      image: product.image_url || '',
      brand: product.brands?.title || product.brand,
      brand_id: product.brand_id,
      rating: product.rating,
      slug: product.slug || product.id,
      options: product.variants?.map((variant: ProductVariant) => ({
        id: variant.id,
        name: variant.color || variant.size || product.name,
        price: variant.price,
        originalPrice: variant.original_price,
        discount: variant.original_price ? 
          Math.round(((variant.original_price - variant.price) / variant.original_price) * 100) : 0,
        image: variant.image_url || product.image_url || '',
        isAvailable: variant.stock_quantity > 0
      })) || []
    }));

    return NextResponse.json({ comboItems: comboProducts });
  } catch (error) {
    console.error('Error fetching combo products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 