'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Spin, Button, Input, message, Typography, Divider, Select } from 'antd';
import { FileImageOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Common Supabase URL patterns
const URL_PATTERNS = [
  {
    name: 'Direct Public Object URL',
    pattern: 'https://static.g-3.vn/storage/v1/object/public/{path}',
    description: 'Standard public URL pattern for Supabase storage'
  },
  {
    name: 'Bucket + Path Format',
    pattern: 'https://static.g-3.vn/storage/v1/object/public/{bucket}/{folder}/{file}',
    description: 'Explicit bucket and folder format'
  },
  {
    name: 'Signed URL',
    pattern: 'https://static.g-3.vn/storage/v1/object/sign/{bucket}/{folder}/{file}',
    description: 'URL with authentication (if using private buckets)'
  },
  {
    name: 'Legacy Format',
    pattern: 'https://static.g-3.vn/{bucket}/{folder}/{file}',
    description: 'Simple direct path (might work with some configurations)'
  },
  {
    name: 'CDN Format',
    pattern: 'https://static.g-3.vn/{path}',
    description: 'Direct CDN path if configured'
  }
];

// Predefined examples
const EXAMPLES = [
  {
    label: 'Example 1: Exact sample URL',
    value: 'g3tech/products/gami/ghe-gami-core/10_de339e361d5341ffb0074207fd417fa5_master.webp'
  },
  {
    label: 'Example 2: Another file in same folder',
    value: 'g3tech/products/gami/ghe-gami-core/2_2a10f2d8e6114be2ab8da7b274583cac_master.webp'
  },
  {
    label: 'Example 3: Root folder format',
    value: 'g3tech/2_2a10f2d8e6114be2ab8da7b274583cac_master.webp'
  }
];

export default function DirectImageTest() {
  const [loading, setLoading] = useState(false);
  const [imagePath, setImagePath] = useState('g3tech/ghe-gami-core/2_2a10f2d8e6114be2ab8da7b274583cac_master.webp');
  const [testUrls, setTestUrls] = useState<string[]>([]);
  const [workingUrls, setWorkingUrls] = useState<string[]>([]);

  // Generate test URLs based on the image path
  const generateTestUrls = (path: string) => {
    // Handle empty path
    if (!path.trim()) {
      message.error('Please enter a valid image path');
      return [];
    }

    const parts = path.split('/');
    
    // We need at least a bucket and filename
    if (parts.length < 2) {
      message.error('Path must include at least bucket and filename (bucket/filename)');
      return [];
    }
    
    const bucket = parts[0];
    const fileName = parts[parts.length - 1];
    const folder = parts.slice(1, parts.length - 1).join('/');
    
    // Create array of possible URLs
    return [
      // Standard Supabase URL format
      `https://static.g-3.vn/storage/v1/object/public/${path}`,
      
      // Alternative format with explicit bucket
      `https://static.g-3.vn/storage/v1/object/public/${bucket}/${folder ? folder + '/' : ''}${fileName}`,
      
      // Signed URL format (for private buckets)
      `https://static.g-3.vn/storage/v1/object/sign/${bucket}/${folder ? folder + '/' : ''}${fileName}`,
      
      // Simple format direct to bucket/folder/file
      `https://static.g-3.vn/${bucket}/${folder ? folder + '/' : ''}${fileName}`,
      
      // Direct CDN format (if configured)
      `https://static.g-3.vn/${path}`
    ];
  };

  const testImage = () => {
    setLoading(true);
    setWorkingUrls([]);
    
    const urls = generateTestUrls(imagePath);
    setTestUrls(urls);
    
    setLoading(false);
  };

  const handleImageLoad = (url: string) => {
    setWorkingUrls(prev => {
      if (!prev.includes(url)) {
        message.success(`Image loaded successfully with format: ${url}`);
        return [...prev, url];
      }
      return prev;
    });
  };

  const handleSelectExample = (value: string) => {
    setImagePath(value);
  };

  useEffect(() => {
    testImage();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-8">Supabase Storage URL Tester</Title>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
        <Title level={3} className="mb-4">Enter Image Path</Title>
        
        <div className="mb-4">
          <Text type="secondary" className="mb-2 block">
            Select an example or enter the complete path to an image in your Supabase storage (bucket/folder/filename)
          </Text>
          
          <Select
            style={{ width: '100%', marginBottom: '16px' }}
            placeholder="Select an example"
            options={EXAMPLES}
            onChange={handleSelectExample}
          />
          
          <div className="flex gap-2">
            <Input 
              value={imagePath} 
              onChange={(e) => setImagePath(e.target.value.trim())}
              placeholder="e.g. g3tech/ghe-gami-core/image.webp"
              className="flex-1"
              prefix={<FileImageOutlined />}
            />
            
            <Button 
              type="primary" 
              onClick={testImage}
              loading={loading}
            >
              Test Image
            </Button>
          </div>
        </div>
        
        <Divider />
        
        <Title level={4}>Supabase Storage URL Patterns</Title>
        <div className="bg-gray-50 p-3 rounded mt-2 text-xs">
          {URL_PATTERNS.map((pattern, index) => (
            <div key={index} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
              <div className="font-semibold">{pattern.name}</div>
              <div className="font-mono bg-gray-100 p-1 rounded mt-1">{pattern.pattern}</div>
              <div className="text-gray-500 mt-1">{pattern.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {workingUrls.length > 0 && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <Title level={4} className="text-green-700">Working URL Formats</Title>
          <div className="mt-2">
            {workingUrls.map((url, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-green-100 last:border-0">
                <div className="flex items-center gap-2">
                  <LinkOutlined className="text-green-500" />
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 break-all"
                  >
                    {url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {testUrls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testUrls.map((url, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={url}
                  alt={`Test ${index + 1}`}
                  fill
                  className="object-contain"
                  onError={() => {
                    console.log(`Failed to load image with URL: ${url}`);
                  }}
                  onLoad={() => handleImageLoad(url)}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Format {index + 1}: {URL_PATTERNS[index]?.name}</h3>
                <div className="bg-gray-100 p-2 rounded text-xs break-all">
                  {url}
                </div>
                <div className="flex justify-between mt-3">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline"
                  >
                    Open in new tab
                  </a>
                  <Text type="secondary" className="text-xs">
                    {workingUrls.includes(url) ? 
                      <span className="text-green-500">✓ Working</span> : 
                      'Checking...'}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 