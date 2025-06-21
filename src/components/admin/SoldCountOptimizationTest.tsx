'use client';

import { useState, useEffect } from 'react';
import { useSoldCounts } from '@/hooks/useSoldCounts';
import { useSoldCountsOptimized } from '@/hooks/useSoldCountsOptimized';

interface PerformanceResult {
  method: string;
  responseTime: number;
  dataCount: number;
  error?: string;
}

interface Product {
  id: string;
  name: string;
  sold_count?: number;
}

export default function SoldCountOptimizationTest() {
  const [testProducts, setTestProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [testing, setTesting] = useState(false);

  // Test với 10 sản phẩm đầu tiên
  const productIds = testProducts.slice(0, 10).map(p => p.id);
  
  // Hook cũ và mới
  const oldMethod = useSoldCounts(productIds);
  const newMethod = useSoldCountsOptimized(productIds);

  // Fetch test products
  useEffect(() => {
    fetchTestProducts();
  }, []);

  const fetchTestProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products?limit=20');
      const data = await response.json();
      setTestProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching test products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const runPerformanceTest = async () => {
    setTesting(true);
    setPerformanceResults([]);
    
    const results: PerformanceResult[] = [];

    try {
      // Test Old Method
      console.log('🔍 Testing old method...');
      const oldStart = Date.now();
      
      try {
        const oldResponse = await fetch(`/api/products/sold-counts?product_ids=${productIds.join(',')}`);
        const oldData = await oldResponse.json();
        const oldTime = Date.now() - oldStart;
        
        results.push({
          method: 'Old Method (JOIN)',
          responseTime: oldTime,
          dataCount: Object.keys(oldData.soldCounts || {}).length,
          error: oldResponse.ok ? undefined : oldData.error
        });
      } catch (error) {
        results.push({
          method: 'Old Method (JOIN)',
          responseTime: Date.now() - oldStart,
          dataCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Test New Method
      console.log('🚀 Testing new method...');
      const newStart = Date.now();
      
      try {
        const newResponse = await fetch(`/api/products/sold-counts-optimized?product_ids=${productIds.join(',')}`);
        const newData = await newResponse.json();
        const newTime = Date.now() - newStart;
        
        results.push({
          method: 'New Method (Column)',
          responseTime: newTime,
          dataCount: Object.keys(newData.soldCounts || {}).length,
          error: newResponse.ok ? undefined : newData.error
        });
      } catch (error) {
        results.push({
          method: 'New Method (Column)',
          responseTime: Date.now() - newStart,
          dataCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      setPerformanceResults(results);
      
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const refreshNewMethod = async () => {
    try {
      await newMethod.refreshSoldCounts(productIds);
      console.log('✅ New method refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing new method:', error);
    }
  };

  const calculateImprovement = () => {
    if (performanceResults.length >= 2) {
      const oldTime = performanceResults.find(r => r.method.includes('Old'))?.responseTime || 0;
      const newTime = performanceResults.find(r => r.method.includes('New'))?.responseTime || 0;
      
      if (oldTime > 0 && newTime > 0) {
        return ((oldTime - newTime) / oldTime * 100).toFixed(1);
      }
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🚀 Sold Count Optimization Test
        </h1>
        
        {/* Test Products */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Test Products</h2>
          {loadingProducts ? (
            <div className="text-gray-600">Loading test products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testProducts.slice(0, 10).map((product) => (
                <div key={product.id} className="bg-gray-50 p-3 rounded border">
                  <div className="font-medium text-sm truncate">{product.name}</div>
                  <div className="text-xs text-gray-600">ID: {product.id}</div>
                  <div className="text-xs text-blue-600">
                    Old: {oldMethod.getSoldCount(product.id)} | 
                    New: {newMethod.getSoldCount(product.id)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={runPerformanceTest}
            disabled={testing || testProducts.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? '🧪 Testing...' : '🧪 Run Performance Test'}
          </button>
          
          <button
            onClick={refreshNewMethod}
            disabled={newMethod.loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {newMethod.loading ? '🔄 Refreshing...' : '🔄 Refresh New Method'}
          </button>
          
          <button
            onClick={fetchTestProducts}
            disabled={loadingProducts}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loadingProducts ? '📦 Loading...' : '📦 Reload Products'}
          </button>
        </div>

        {/* Performance Results */}
        {performanceResults.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Performance Results</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Response Time</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Data Count</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2 font-medium">
                        {result.method}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span className={result.responseTime < 100 ? 'text-green-600' : result.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'}>
                          {result.responseTime}ms
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {result.dataCount} products
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {result.error ? (
                          <span className="text-red-600">❌ {result.error}</span>
                        ) : (
                          <span className="text-green-600">✅ Success</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {calculateImprovement() && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <div className="text-lg font-semibold text-green-800">
                  🎉 Performance Improvement: {calculateImprovement()}% faster!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hook States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Method Status */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-3">📊 Old Method Status</h3>
            <div className="space-y-2 text-sm">
              <div>Loading: {oldMethod.loading ? '🔄 Yes' : '✅ No'}</div>
              <div>Error: {oldMethod.error ? `❌ ${oldMethod.error}` : '✅ None'}</div>
              <div>Data Count: {Object.keys(oldMethod.soldCounts).length} products</div>
              <div>Cache: 10 minutes</div>
            </div>
          </div>

          {/* New Method Status */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🚀 New Method Status</h3>
            <div className="space-y-2 text-sm">
              <div>Loading: {newMethod.loading ? '🔄 Yes' : '✅ No'}</div>
              <div>Error: {newMethod.error ? `❌ ${newMethod.error}` : '✅ None'}</div>
              <div>Data Count: {Object.keys(newMethod.soldCounts).length} products</div>
              <div>Cache: 30 minutes</div>
            </div>
          </div>
        </div>

        {/* Data Comparison */}
        {testProducts.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Data Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Product</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Old Method</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">New Method</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {testProducts.slice(0, 10).map((product) => {
                    const oldCount = oldMethod.getSoldCount(product.id);
                    const newCount = newMethod.getSoldCount(product.id);
                    const matches = oldCount === newCount;
                    
                    return (
                      <tr key={product.id} className={matches ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="border border-gray-300 px-2 py-1">
                          <div className="truncate max-w-xs" title={product.name}>
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">ID: {product.id}</div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {oldCount}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {newCount}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          {matches ? '✅' : '❌'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 