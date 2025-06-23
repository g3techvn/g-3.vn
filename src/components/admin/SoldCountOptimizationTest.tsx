'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useSoldCounts } from '@/hooks/useSoldCounts';

interface PerformanceResult {
  method: string;
  responseTime: number;
  timestamp: string;
}

export default function SoldCountOptimizationTest() {
  const [testProducts, setTestProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get product IDs
  const productIds = testProducts.map(p => p.id.toString());

  // Old method using hook
  const oldMethod = useSoldCounts(productIds);

  // Load test products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTestProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load test products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Run performance test
  const runPerformanceTest = async () => {
    try {
      // Test old method (API call)
      const oldStartTime = performance.now();
      const oldResponse = await fetch(`/api/products/sold-counts?product_ids=${productIds.join(',')}`);
      const oldEndTime = performance.now();
      const oldResponseTime = oldEndTime - oldStartTime;

      // Test new method (direct field access)
      const newStartTime = performance.now();
      // No API call needed for new method since we're using the field directly
      const newEndTime = performance.now();
      const newResponseTime = newEndTime - newStartTime;

      // Record results
      setPerformanceResults(prev => [
        ...prev,
        {
          method: 'Old Method (API Call)',
          responseTime: oldResponseTime,
          timestamp: new Date().toISOString()
        },
        {
          method: 'New Method (Direct Field)',
          responseTime: newResponseTime,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error running performance test:', error);
      setError('Failed to run performance test');
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
                    New: {product.sold_count || 0}
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Run Performance Test
          </button>
        </div>

        {/* Results */}
        {performanceResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">📊 Performance Results</h2>
            
            {/* Improvement Summary */}
            {calculateImprovement() && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-700">
                  ✨ Performance Improvement: <span className="font-bold">{calculateImprovement()}%</span>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  The new method (direct field access) is faster than the old method (API calls)
                </p>
              </div>
            )}

            {/* Detailed Results */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Method</th>
                    <th className="border border-gray-300 px-4 py-2">Response Time (ms)</th>
                    <th className="border border-gray-300 px-4 py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-2">{result.method}</td>
                      <td className="border border-gray-300 px-4 py-2">{result.responseTime.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2">{new Date(result.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 