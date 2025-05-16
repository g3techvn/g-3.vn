'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spin, Button, Select, message, Typography, Divider } from 'antd';
import { createBrowserClient } from '@/lib/supabase';
import { ImageItem } from '@/types/supabase';

const { Title, Text, Paragraph } = Typography;

// Update the folder options with more precise paths to test
const FOLDER_OPTIONS = [
  {
    label: 'Ghe Gami Core (main path)',
    value: 'products/gami/ghe-gami-core'
  },
  {
    label: 'Just folder name',
    value: 'ghe-gami-core'
  },
  {
    label: 'With bucket prefix',
    value: 'g3tech/products/gami/ghe-gami-core'
  },
  {
    label: 'Products > Gami',
    value: 'products/gami'
  },
  {
    label: 'Products',
    value: 'products'
  },
  {
    label: 'Root',
    value: ''
  }
];

export default function DirectSdkGallery() {
  const [folder, setFolder] = useState('products/gami/ghe-gami-core');
  const [bucket, setBucket] = useState('g3tech');
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    setImages([]);
    setDebug(null);

    try {
      console.log(`Fetching from ${bucket}/${folder} using Supabase SDK directly`);
      
      // Create a client-side Supabase client
      const supabase = createBrowserClient();
      
      // First, list the files in the folder
      console.log('Attempting to list files in folder:', folder);
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) {
        console.error('Error listing files:', listError);
        throw new Error(`Failed to list files: ${listError.message}`);
      }

      // Log the raw data for debugging
      console.log('Raw data from Supabase SDK:', files);
      setDebug({
        raw_data: files,
        folder,
        bucket,
        folder_options: FOLDER_OPTIONS.map(opt => opt.value)
      });
      
      if (!files || files.length === 0) {
        console.log('No files found in folder:', folder);
        setLoading(false);
        return;
      }
      
      // Filter out folders, only keep files
      const imageFiles = files.filter(file => 
        !file.metadata?.mimetype?.includes('directory') && 
        file.name.includes('.')
      );
      
      console.log('Filtered files:', imageFiles.map(f => f.name));
      
      // Generate URLs for each file
      const imageItems: ImageItem[] = await Promise.all(
        imageFiles.map(async (file) => {
          const filePath = folder ? `${folder}/${file.name}` : file.name;
          
          // Get public URL
          const { data: urlData } = await supabase
            .storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          // Also create a direct URL
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
      
      setImages(imageItems);
      console.log(`Found ${imageItems.length} images using SDK`);
    } catch (err) {
      console.error('Error fetching with SDK:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      message.error('Failed to fetch images with Supabase SDK');
    } finally {
      setLoading(false);
    }
  };

  // Fetch images on initial load and when path changes
  useEffect(() => {
    fetchImages();
  }, [folder, bucket]);

  const handleFolderChange = (value: string) => {
    setFolder(value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8">Direct Supabase SDK Gallery</Title>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <Title level={4} className="mb-4">Select Folder Path</Title>
        
        <div className="mb-4">
          <Select
            style={{ width: '100%' }}
            value={folder}
            onChange={handleFolderChange}
            options={FOLDER_OPTIONS}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Text>
            Current path: <Text strong>{bucket}/{folder}</Text>
          </Text>
          
          <Button 
            type="primary" 
            onClick={fetchImages}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin
            size="large"
            tip="Loading images directly from Supabase..."
            className="text-center"
          >
            <div className="p-12" />
          </Spin>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4 border border-red-200 rounded-md">
          {error}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">No images found in this folder using direct SDK access</p>
          
          <Button 
            onClick={() => setDebug((prev: any) => prev ? null : debug)} 
            type="dashed"
          >
            {debug ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
          
          {debug && (
            <div className="mt-4 p-4 bg-gray-100 text-left rounded-md">
              <h3 className="text-lg font-medium mb-2">Debug Information</h3>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <Title level={4}>Found {images.length} Images</Title>
            
            <Button 
              onClick={() => setDebug((prev: any) => prev ? null : debug)} 
              type="dashed"
              size="small"
            >
              {debug ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
          </div>
          
          {debug && (
            <div className="mb-4 p-4 bg-gray-100 text-left rounded-md">
              <pre className="text-xs overflow-auto max-h-40">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image, index) => (
              <div 
                key={`${image.name}-${index}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full bg-gray-50">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    onError={() => {
                      console.log(`Failed to load image with URL: ${image.url}`);
                      // Try alternative URL
                      const img = document.getElementById(`img-${index}`) as HTMLImageElement;
                      if (img && image.alternativeUrl) {
                        img.src = image.alternativeUrl;
                      }
                    }}
                    id={`img-${index}`}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-800 truncate" title={image.name}>
                    {image.name}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <a 
                      href={image.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Original
                    </a>
                    
                    <a 
                      href={image.alternativeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-green-500 hover:underline text-sm"
                    >
                      Alt URL
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 