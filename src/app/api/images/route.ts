import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ImageItem, StorageItem } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Default to the correct path based on the sample URL
  const folder = (searchParams.get('folder') || 'products/gami/ghe-gami-core').replace(/^\/|\/$/g, '');
  const bucket = searchParams.get('bucket') || 'g3tech';
  
  console.log('Fetching images from:', { bucket, folder });
  
  try {
    const supabase = createServerClient();
    
    // Generate the correct full path for listing
    const fullPath = folder;
    
    // List all files in the specified folder
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list(fullPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error('Supabase list error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Raw data from Supabase:', data);
    
    // If data is null or undefined, return an appropriate response
    if (!data) {
      console.log('No data returned from Supabase');
      return NextResponse.json({ images: [], message: 'No data returned from storage' }, { status: 200 });
    }
    
    // Filter out any potential folders in results and only keep files
    const files = data.filter(item => !item.metadata?.mimetype?.includes('directory') && item.name.includes('.'));
    console.log('Filtered files:', files.map(f => f.name));
    
    // Try to list root level if no files found and folder isn't empty
    if (files.length === 0 && folder !== '') {
      console.log('No files found in specified folder, trying root level');
      try {
        const rootResponse = await supabase.storage.from(bucket).list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
        
        if (!rootResponse.error && rootResponse.data) {
          console.log('Root level items:', rootResponse.data.map(item => item.name));
          
          // Check if the folder exists at root level
          const folderExists = rootResponse.data.some(item => 
            item.name === folder || item.name.startsWith(`${folder}/`)
          );
          
          if (folderExists) {
            console.log(`Folder '${folder}' exists at root level`);
          } else {
            console.log(`Folder '${folder}' not found at root level`);
          }
        }
      } catch (listError) {
        console.error('Error listing root level:', listError);
      }
    }
    
    // Generate URLs for each file
    const images: ImageItem[] = await Promise.all(
      files.map(async (file) => {
        // Build the path based on the sample URL format
        const filePath = `${folder}/${file.name}`;
        
        const { data: urlData } = await supabase
          .storage
          .from(bucket)
          .getPublicUrl(filePath);
        
        // Alternative URL format using the exact pattern from the sample
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
    
    console.log(`Generated ${images.length} image URLs`);
    
    // If no images found but we have folders, suggest them
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
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 