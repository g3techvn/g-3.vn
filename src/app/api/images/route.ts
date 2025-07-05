import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ImageItem, StorageItem } from '@/types/supabase';

import { rateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit public API
  const ip = getClientIP(request);
  const rateLimitResult = await rateLimit(request, RATE_LIMITS.PUBLIC);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }
  const { searchParams } = new URL(request.url);
  const folder = (searchParams.get('folder') || 'products/gami/ghe-gami-core').replace(/^\/|\/$/g, '');
  const bucket = searchParams.get('bucket') || 'g3tech';
  try {
    const supabase = createServerClient();
    const fullPath = folder;
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(fullPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ images: [], message: 'No data returned from storage' }, { status: 200 });
    }
    const files = data.filter(item => !item.metadata?.mimetype?.includes('directory') && item.name.includes('.'));
    if (files.length === 0 && folder !== '') {
      try {
        const rootResponse = await supabase.storage.from(bucket).list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
        if (!rootResponse.error && rootResponse.data) {
          const folderExists = rootResponse.data.some(item =>
            item.name === folder || item.name.startsWith(`${folder}/`)
          );
          if (folderExists) {
            // Folder exists at root level
          } else {
            // Folder not found at root level
          }
        }
      } catch (listError) {
        // Error listing root level
      }
    }
    const images: ImageItem[] = await Promise.all(
      files.map(async (file) => {
        const filePath = `${folder}/${file.name}`;
        const { data: urlData } = await supabase
          .storage
          .from(bucket)
          .getPublicUrl(filePath);
        const directUrl = `https://static.g-3.vn/storage/v1/object/public/${bucket}/${filePath}`;
        return {
          name: file.name,
          url: urlData.publicUrl,
          alternativeUrl: directUrl,
          size: file.metadata?.size,
          type: file.metadata?.mimetype,
          created_at: file.created_at,
          path: filePath
        };
      })
    );
    const folders = data.filter(item =>
      !item.name.includes('.') ||
      item.metadata?.mimetype?.includes('directory')
    );
    const suggestedFolders = folders.map(f =>
      folder ? `${folder}/${f.name}` : f.name
    );
    return NextResponse.json({
      images,
      debug: {
        bucket,
        folder,
        raw_count: data.length,
        filtered_count: files.length,
        folders_count: folders.length,
        suggested_folders: suggestedFolders,
        image_count: images.length,
        first_image_url: images.length > 0 ? images[0].url : null,
        first_image_alt_url: images.length > 0 ? images[0].alternativeUrl : null,
        sample_url: "https://static.g-3.vn/storage/v1/object/public/g3tech/products/gami/ghe-gami-core/10_de339e361d5341ffb0074207fd417fa5_master.webp"
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 