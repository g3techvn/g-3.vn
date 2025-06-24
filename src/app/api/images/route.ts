import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get('bucket') || 'g3tech';
  const folder = searchParams.get('folder');
  
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // If no folder specified, list buckets
    if (!folder) {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        throw error;
      }

      return NextResponse.json(data);
    }

    // List files in the specified folder
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) {
      throw error;
    }

    // Get public URLs for each file
    const images = data
      .filter(file => !file.metadata?.isFolder) // Filter out folders
      .map(file => ({
        name: file.name,
        url: supabase.storage
          .from(bucket)
          .getPublicUrl(`${folder}/${file.name}`).data.publicUrl,
        type: file.metadata?.mimetype,
        size: file.metadata?.size,
      }));
    
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' }, 
      { status: 500 }
    );
  }
} 