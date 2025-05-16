'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Typography, Divider, Space, Card, Tag, Spin } from 'antd';
import { createBrowserClient } from '@/lib/supabase';

const { Title, Text, Paragraph } = Typography;

// Test parameters
interface TestParams {
  bucket: string;
  folder: string;
  filename: string;
}

// Test result
interface TestResult {
  method: string;
  success: boolean;
  url?: string;
  error?: string;
  time: number;
  data?: any;
}

export default function SupabaseStorageTest() {
  const [params, setParams] = useState<TestParams>({
    bucket: 'g3tech',
    folder: 'products/gami/ghe-gami-core',
    filename: '10_de339e361d5341ffb0074207fd417fa5_master.webp'
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const resetResults = () => {
    setResults([]);
  };

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    resetResults();
    setLoading(true);
    
    // Run all test methods
    await testListFiles();
    await testGetPublicUrl();
    await testDirectUrl();
    await testCreateSignedUrl();
    await testDownload();
    
    setLoading(false);
  };

  // Test method 1: List files in folder
  const testListFiles = async () => {
    const startTime = Date.now();
    try {
      const supabase = createBrowserClient();
      
      const { data, error } = await supabase
        .storage
        .from(params.bucket)
        .list(params.folder, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) throw error;
      
      const endTime = Date.now();
      addResult({
        method: 'List Files',
        success: true,
        time: endTime - startTime,
        data: data
      });
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      addResult({
        method: 'List Files',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        time: endTime - startTime
      });
    }
  };

  // Test method 2: Get public URL
  const testGetPublicUrl = async () => {
    const startTime = Date.now();
    try {
      const supabase = createBrowserClient();
      const path = `${params.folder}/${params.filename}`;
      
      // Get the public URL using Supabase SDK
      const { data } = await supabase
        .storage
        .from(params.bucket)
        .getPublicUrl(path);
      
      // This method doesn't throw an error, it always returns data
      const endTime = Date.now();
      addResult({
        method: 'Get Public URL',
        success: true,
        url: data.publicUrl,
        time: endTime - startTime,
        data: data
      });
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      addResult({
        method: 'Get Public URL',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        time: endTime - startTime
      });
    }
  };

  // Test method 3: Direct URL construction
  const testDirectUrl = async () => {
    const startTime = Date.now();
    try {
      const path = `${params.folder}/${params.filename}`;
      const url = `https://static.g-3.vn/storage/v1/object/public/${params.bucket}/${path}`;
      
      // Test if URL works by trying to fetch headers
      const response = await fetch(url, { method: 'HEAD' });
      
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      
      addResult({
        method: 'Direct URL Construction',
        success: true,
        url: url,
        time: endTime - startTime,
        data: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
      
      return { url };
    } catch (error) {
      const endTime = Date.now();
      const url = `https://static.g-3.vn/storage/v1/object/public/${params.bucket}/${params.folder}/${params.filename}`;
      
      addResult({
        method: 'Direct URL Construction',
        success: false,
        url: url,
        error: error instanceof Error ? error.message : String(error),
        time: endTime - startTime
      });
    }
  };

  // Test method 4: Create signed URL
  const testCreateSignedUrl = async () => {
    const startTime = Date.now();
    try {
      const supabase = createBrowserClient();
      const path = `${params.folder}/${params.filename}`;
      
      const { data, error } = await supabase
        .storage
        .from(params.bucket)
        .createSignedUrl(path, 60); // 60 seconds expiry
      
      if (error) throw error;
      
      const endTime = Date.now();
      addResult({
        method: 'Create Signed URL',
        success: true,
        url: data.signedUrl,
        time: endTime - startTime,
        data: data
      });
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      addResult({
        method: 'Create Signed URL',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        time: endTime - startTime
      });
    }
  };

  // Test method 5: Download
  const testDownload = async () => {
    const startTime = Date.now();
    try {
      const supabase = createBrowserClient();
      const path = `${params.folder}/${params.filename}`;
      
      const { data, error } = await supabase
        .storage
        .from(params.bucket)
        .download(path);
      
      if (error) throw error;
      
      const endTime = Date.now();
      const blob = data;
      const objectUrl = URL.createObjectURL(blob);
      
      addResult({
        method: 'Download File',
        success: true,
        url: objectUrl,
        time: endTime - startTime,
        data: {
          size: blob.size,
          type: blob.type
        }
      });
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      addResult({
        method: 'Download File',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        time: endTime - startTime
      });
    }
  };

  const handleInputChange = (key: keyof TestParams, value: string) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-4">Supabase Storage Access Tests</Title>
      <Paragraph className="text-center mb-8">
        Testing different methods to access files in Supabase Storage
      </Paragraph>
      
      <Card className="mb-8">
        <Title level={4}>Test Parameters</Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Text strong>Bucket</Text>
            <Input 
              value={params.bucket} 
              onChange={e => handleInputChange('bucket', e.target.value)}
              placeholder="Bucket name"
            />
          </div>
          <div>
            <Text strong>Folder Path</Text>
            <Input 
              value={params.folder} 
              onChange={e => handleInputChange('folder', e.target.value)}
              placeholder="Folder path (no leading/trailing slashes)"
            />
          </div>
          <div>
            <Text strong>Filename</Text>
            <Input 
              value={params.filename} 
              onChange={e => handleInputChange('filename', e.target.value)}
              placeholder="Filename with extension"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Text type="secondary">Full path: {params.bucket}/{params.folder}/{params.filename}</Text>
          <Space>
            <Button onClick={resetResults} disabled={loading}>
              Clear Results
            </Button>
            <Button type="primary" onClick={runAllTests} loading={loading}>
              Run All Tests
            </Button>
          </Space>
        </div>
      </Card>
      
      {loading && (
        <div className="text-center my-8">
          <Spin tip="Running tests..." />
        </div>
      )}
      
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {results.map((result, index) => (
            <Card 
              key={index}
              title={
                <div className="flex items-center gap-2">
                  <span>Method: {result.method}</span>
                  {result.success ? (
                    <Tag color="success">Success</Tag>
                  ) : (
                    <Tag color="error">Failed</Tag>
                  )}
                  <Tag color="default">{result.time}ms</Tag>
                </div>
              }
              className={result.success ? "border-green-200" : "border-red-200"}
            >
              {result.url && (
                <div className="mb-4">
                  <Text strong>URL:</Text>
                  <div className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {result.url}
                    </a>
                  </div>
                </div>
              )}
              
              {result.error && (
                <div className="mb-4">
                  <Text strong type="danger">Error:</Text>
                  <div className="bg-red-50 p-2 rounded text-xs text-red-800">
                    {result.error}
                  </div>
                </div>
              )}
              
              {result.data && (
                <div>
                  <Divider orientation="left">Result Data</Divider>
                  <div className="bg-gray-50 p-2 rounded">
                    <pre className="text-xs overflow-auto max-h-60">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {result.method === 'Download File' && result.success && result.url && (
                <div className="mt-4">
                  <Text strong>Preview:</Text>
                  <div className="mt-2 h-48 relative">
                    <img 
                      src={result.url} 
                      alt="Downloaded file" 
                      className="h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 