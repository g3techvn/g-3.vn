'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Divider, Button, message, Spin } from 'antd';
import { createBrowserClient } from '@/lib/supabase';
import Image from 'next/image';

const { Title, Text, Paragraph } = Typography;

// Known working image from the sample URL
const SAMPLE_IMAGE = {
  bucket: 'g3tech',
  folder: 'products/gami/ghe-gami-core',
  filename: '10_de339e361d5341ffb0074207fd417fa5_master.webp'
};

export default function DirectImagePage() {
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchDirectImage = async () => {
    setLoading(true);
    setError(null);
    setImageUrls([]);

    try {
      // Create Supabase client
      const supabase = createBrowserClient();
      
      // Construct all possible paths for the image
      const paths = [
        // Main path from sample URL
        `${SAMPLE_IMAGE.folder}/${SAMPLE_IMAGE.filename}`,
        // Without folder
        SAMPLE_IMAGE.filename,
        // With bucket prefix
        `${SAMPLE_IMAGE.bucket}/${SAMPLE_IMAGE.folder}/${SAMPLE_IMAGE.filename}`,
        // Just the subfolder
        `ghe-gami-core/${SAMPLE_IMAGE.filename}`
      ];

      // Get URLs through Supabase SDK
      const sdkUrls = await Promise.all(
        paths.map(async (path) => {
          const { data } = await supabase
            .storage
            .from(SAMPLE_IMAGE.bucket)
            .getPublicUrl(path);
          
          return {
            path,
            url: data.publicUrl
          };
        })
      );

      // Try direct URL construction
      const directUrls = paths.map(path => ({
        path,
        url: `https://static.g-3.vn/storage/v1/object/public/${SAMPLE_IMAGE.bucket}/${path}`
      }));

      // Combine all URLs
      const allUrls = [...sdkUrls, ...directUrls];
      
      // Add hard-coded sample URL that we know works
      allUrls.push({
        path: 'Sample URL (Known working)',
        url: 'https://static.g-3.vn/storage/v1/object/public/g3tech/products/gami/ghe-gami-core/10_de339e361d5341ffb0074207fd417fa5_master.webp'
      });
      
      setDebugInfo({
        paths,
        sdkUrls: sdkUrls.map(item => item.url),
        directUrls: directUrls.map(item => item.url)
      });
      
      // Extract just the URLs
      const urls = allUrls.map(item => item.url);
      setImageUrls(urls);
      
      message.success('Generated image URLs successfully');
    } catch (err) {
      console.error('Error fetching direct image:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      message.error('Failed to generate image URLs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectImage();
  }, []);

  const handleImageLoad = (url: string) => {
    message.success(`Successfully loaded image: ${url.substring(0, 30)}...`);
  };

  const handleImageError = (url: string) => {
    console.log(`Failed to load image: ${url}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-4">Direct Image Access</Title>
      <Paragraph className="text-center mb-8">
        Testing direct access to a known image using different URL formats
      </Paragraph>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin tip="Generating image URLs...">
            <div className="p-12" />
          </Spin>
        </div>
      ) : (
        <>
          <Card className="mb-8">
            <Title level={4}>Known Image Details</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Text strong>Bucket:</Text> <Text>{SAMPLE_IMAGE.bucket}</Text>
              </div>
              <div>
                <Text strong>Folder:</Text> <Text>{SAMPLE_IMAGE.folder}</Text>
              </div>
              <div>
                <Text strong>Filename:</Text> <Text>{SAMPLE_IMAGE.filename}</Text>
              </div>
            </div>
            <Divider />
            <Button type="primary" onClick={fetchDirectImage} loading={loading}>
              Refresh URLs
            </Button>
          </Card>
          
          {error && (
            <div className="text-red-500 text-center p-4 border border-red-200 rounded-md mb-8">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {imageUrls.map((url, index) => (
              <Card 
                key={index} 
                title={`Image Format ${index + 1}`}
                className="overflow-hidden"
              >
                <div className="h-64 relative bg-gray-100 mb-4">
                  <img
                    src={url}
                    alt={`Test format ${index + 1}`}
                    className="object-contain w-full h-full"
                    onLoad={() => handleImageLoad(url)}
                    onError={() => handleImageError(url)}
                  />
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs overflow-auto mb-3">
                  <Text copyable>{url}</Text>
                </div>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open in new tab
                </a>
              </Card>
            ))}
          </div>
          
          <Card title="Debug Information">
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Card>
        </>
      )}
    </div>
  );
} 