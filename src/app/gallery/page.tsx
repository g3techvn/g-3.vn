'use client';

import { ImageGallery } from '@/components/storage/ImageGallery';
import { Button, Typography, Card, Space } from 'antd';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

// Based on the provided sample URL:
// https://static.g-3.vn/storage/v1/object/public/g3tech/products/gami/ghe-gami-core/10_de339e361d5341ffb0074207fd417fa5_master.webp
// The correct path structure is: products/gami/ghe-gami-core
const predefinedFolders = [
  // Correct path based on the sample URL
  'products/gami/ghe-gami-core',
  // Parent folders for navigation
  'products/gami',
  'products',
  // Root level for exploration
  ''
];

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-2">G3 Products Gallery</Title>
      <Paragraph className="text-center mb-8">
        Different approaches to access Supabase Storage images
      </Paragraph>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="API Route" className="text-center">
          <p className="mb-4">Access images through Next.js API route</p>
          <Link href="/gallery" passHref>
            <Button type="primary">View Gallery</Button>
          </Link>
        </Card>
        
        <Card title="Direct SDK" className="text-center">
          <p className="mb-4">Use Supabase SDK client-side directly</p>
          <Link href="/gallery/direct-sdk" passHref>
            <Button type="primary">View SDK Gallery</Button>
          </Link>
        </Card>
        
        <Card title="URL Tester" className="text-center">
          <p className="mb-4">Test direct image URLs from Supabase</p>
          <Link href="/gallery/direct" passHref>
            <Button type="primary">Test URLs</Button>
          </Link>
        </Card>
        
        <Card title="Direct Image" className="text-center">
          <p className="mb-4">Access a specific known image directly</p>
          <Link href="/gallery/direct-image" passHref>
            <Button type="primary">View Image</Button>
          </Link>
        </Card>
      </div>
      
      <Card title="Comprehensive SDK Tests" className="text-center mb-8">
        <p className="mb-4">
          Run comprehensive tests of all Supabase Storage SDK methods and see which ones work
        </p>
        <Link href="/gallery/sdk-test" passHref>
          <Button type="primary" size="large">Run SDK Tests</Button>
        </Link>
      </Card>
      
      <ImageGallery 
        // Use the correct path from the sample URL
        defaultFolder="products/gami/ghe-gami-core"
        defaultBucket="g3tech"
        predefinedFolders={predefinedFolders}
        title="Standard Gallery (API-based)"
        showControls={true}
        showSorting={true}
        showCustomFolder={true}
      />
    </div>
  );
}
