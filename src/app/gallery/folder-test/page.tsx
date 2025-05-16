'use client';

import { useState, useEffect } from 'react';
import { Button, Typography, Card, Spin, Collapse, message, Select } from 'antd';
import { createBrowserClient } from '@/lib/supabase';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// Test all possible folder paths to find which ones work
const FOLDER_TEST_PATHS = [
  { label: 'Full path from sample', path: 'products/gami/ghe-gami-core' },
  { label: 'Direct folder', path: 'ghe-gami-core' },
  { label: 'Parent folder', path: 'products/gami' },
  { label: 'Root folder', path: 'products' },
  { label: 'Empty path (bucket root)', path: '' },
  { label: 'Just products', path: 'products' },
  { label: 'Just gami', path: 'gami' },
  { label: 'With leading slash', path: '/products/gami/ghe-gami-core' },
  { label: 'With trailing slash', path: 'products/gami/ghe-gami-core/' },
  { label: 'Double nested', path: 'products/gami/ghe-gami-core/images' },
  { label: 'With bucket prefix', path: 'g3tech/products/gami/ghe-gami-core' },
];

interface FolderTestResult {
  path: string;
  label: string;
  success: boolean;
  error?: string;
  data?: any;
}

export default function FolderTestPage() {
  const [results, setResults] = useState<FolderTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [bucket, setBucket] = useState('g3tech');
  const [customPath, setCustomPath] = useState('');

  const testAllFolders = async () => {
    setLoading(true);
    setResults([]);
    
    // Create Supabase client
    const supabase = createBrowserClient();
    
    // Test each path
    const newResults: FolderTestResult[] = [];
    
    for (const folderInfo of FOLDER_TEST_PATHS) {
      try {
        console.log(`Testing folder path: ${folderInfo.path}`);
        
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .list(folderInfo.path, {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (error) {
          newResults.push({
            path: folderInfo.path,
            label: folderInfo.label,
            success: false,
            error: error.message
          });
          continue;
        }
        
        newResults.push({
          path: folderInfo.path,
          label: folderInfo.label,
          success: true,
          data: {
            items: data.length,
            fileNames: data.map(item => item.name),
            rawData: data
          }
        });
        
        console.log(`Found ${data.length} items in ${folderInfo.path}`);
      } catch (err) {
        newResults.push({
          path: folderInfo.path,
          label: folderInfo.label,
          success: false,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    
    // If custom path is provided, test it too
    if (customPath.trim()) {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .list(customPath.trim(), {
            limit: 100,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (error) {
          newResults.push({
            path: customPath.trim(),
            label: 'Custom path',
            success: false,
            error: error.message
          });
        } else {
          newResults.push({
            path: customPath.trim(),
            label: 'Custom path',
            success: true,
            data: {
              items: data.length,
              fileNames: data.map(item => item.name),
              rawData: data
            }
          });
        }
      } catch (err) {
        newResults.push({
          path: customPath.trim(),
          label: 'Custom path',
          success: false,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
    
    setResults(newResults);
    setLoading(false);
    
    // Check if any paths succeeded
    const successfulPaths = newResults.filter(r => r.success && r.data?.items > 0);
    if (successfulPaths.length > 0) {
      message.success(`Found ${successfulPaths.length} working folder paths!`);
    } else {
      message.error('No working folder paths found');
    }
  };

  useEffect(() => {
    testAllFolders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="text-center mb-4">Supabase Folder Path Test</Title>
      <Paragraph className="text-center mb-8">
        Testing different folder paths to find which ones work with Supabase Storage
      </Paragraph>
      
      <Card className="mb-8">
        <div className="mb-4">
          <Text strong>Bucket:</Text>
          <Select 
            style={{ width: '100%' }}
            value={bucket}
            onChange={setBucket}
            options={[
              { label: 'g3tech', value: 'g3tech' }
            ]}
          />
        </div>
        
        <div className="mb-4">
          <Text strong>Custom Folder Path:</Text>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              className="flex-1 border p-2 rounded"
              placeholder="Enter custom path to test"
            />
          </div>
        </div>
        
        <div className="text-center">
          <Button type="primary" onClick={testAllFolders} loading={loading}>
            Test All Paths
          </Button>
        </div>
      </Card>
      
      {loading ? (
        <div className="text-center my-8">
          <Spin tip="Testing folder paths..." />
        </div>
      ) : (
        <>
          <Title level={4} className="mb-4">
            Test Results: {results.filter(r => r.success).length} working paths found
          </Title>
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            <Collapse defaultActiveKey={['working']} className="mb-8">
              <Panel header={`Working Paths (${results.filter(r => r.success && r.data?.items > 0).length})`} key="working">
                {results
                  .filter(r => r.success && r.data?.items > 0)
                  .map((result, index) => (
                    <Card 
                      key={`success-${index}`} 
                      className="mb-4 border-green-200"
                      title={
                        <div className="flex justify-between items-center">
                          <span>{result.label}</span>
                          <span className="text-green-500 font-medium">
                            {result.data.items} items
                          </span>
                        </div>
                      }
                    >
                      <div className="mb-2">
                        <Text strong>Path:</Text> 
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                          {result.path || '(empty string)'}
                        </code>
                      </div>
                      
                      <div className="mb-4">
                        <Text strong>Files:</Text>
                        <div className="bg-gray-50 p-2 rounded mt-1 text-xs">
                          {result.data.fileNames.join(', ')}
                        </div>
                      </div>
                      
                      <Collapse>
                        <Panel header="Raw Data" key="raw">
                          <div className="bg-gray-50 p-2 rounded">
                            <pre className="text-xs overflow-auto max-h-60">
                              {JSON.stringify(result.data.rawData, null, 2)}
                            </pre>
                          </div>
                        </Panel>
                      </Collapse>
                    </Card>
                  ))}
              </Panel>
              
              <Panel header={`Empty Paths (${results.filter(r => r.success && r.data?.items === 0).length})`} key="empty">
                {results
                  .filter(r => r.success && r.data?.items === 0)
                  .map((result, index) => (
                    <Card 
                      key={`empty-${index}`} 
                      className="mb-4 border-yellow-200"
                      title={result.label}
                    >
                      <Text>
                        Path <code className="bg-gray-100 px-2 py-1 rounded">{result.path || '(empty string)'}</code> is 
                        valid but contains no items
                      </Text>
                    </Card>
                  ))}
              </Panel>
              
              <Panel header={`Failed Paths (${results.filter(r => !r.success).length})`} key="failed">
                {results
                  .filter(r => !r.success)
                  .map((result, index) => (
                    <Card 
                      key={`failed-${index}`} 
                      className="mb-4 border-red-200"
                      title={result.label}
                    >
                      <div className="mb-2">
                        <Text strong>Path:</Text> 
                        <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                          {result.path || '(empty string)'}
                        </code>
                      </div>
                      
                      <div className="bg-red-50 p-2 rounded text-red-800 text-sm">
                        {result.error}
                      </div>
                    </Card>
                  ))}
              </Panel>
            </Collapse>
          </div>
        </>
      )}
    </div>
  );
} 