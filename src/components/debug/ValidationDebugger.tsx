'use client';

import { useState } from 'react';
import { CreateOrderSchema } from '@/lib/validation/validation';

interface ValidationDebuggerProps {
  orderData: any;
  isVisible?: boolean;
}

export default function ValidationDebugger({ orderData, isVisible = false }: ValidationDebuggerProps) {
  const [showDebug, setShowDebug] = useState(isVisible);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateOrderData = () => {
    try {
      const result = CreateOrderSchema.safeParse(orderData);
      setValidationResult(result);
      return result;
    } catch (error) {
      setValidationResult({ 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        } 
      });
      return null;
    }
  };

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm z-50"
      >
        🐛 Debug Validation
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">🐛 Validation Debugger</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={validateOrderData}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Validate Current Data
        </button>

        {validationResult && (
          <div className="border border-gray-200 rounded p-3">
            <div className={`text-sm font-medium mb-2 ${
              validationResult.success ? 'text-green-600' : 'text-red-600'
            }`}>
              {validationResult.success ? '✅ Validation PASSED' : '❌ Validation FAILED'}
            </div>

            {!validationResult.success && validationResult.error?.issues && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-700">Errors:</div>
                {validationResult.error.issues.map((issue: any, index: number) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <div className="font-medium">Path: {issue.path.join('.')}</div>
                    <div>Message: {issue.message}</div>
                  </div>
                ))}
              </div>
            )}

            {validationResult.success && (
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                All validation rules passed! ✨
              </div>
            )}
          </div>
        )}

        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Current Order Data:</div>
          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(orderData, null, 2)}
          </pre>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Quick Checks:</div>
          <div className="space-y-1 text-xs">
            <div className={orderData?.buyer_info?.fullName ? 'text-green-600' : 'text-red-600'}>
              • Full Name: {orderData?.buyer_info?.fullName ? '✅' : '❌'}
            </div>
            <div className={orderData?.buyer_info?.phone ? 'text-green-600' : 'text-red-600'}>
              • Phone: {orderData?.buyer_info?.phone ? '✅' : '❌'}
            </div>
            <div className={orderData?.shipping_info?.address ? 'text-green-600' : 'text-red-600'}>
              • Address: {orderData?.shipping_info?.address ? '✅' : '❌'}
            </div>
            <div className={orderData?.shipping_info?.city ? 'text-green-600' : 'text-red-600'}>
              • City: {orderData?.shipping_info?.city ? '✅' : '❌'}
            </div>
            <div className={orderData?.payment_method ? 'text-green-600' : 'text-red-600'}>
              • Payment Method: {orderData?.payment_method ? '✅' : '❌'}
            </div>
            <div className={orderData?.cart_items?.length > 0 ? 'text-green-600' : 'text-red-600'}>
              • Cart Items: {orderData?.cart_items?.length > 0 ? `✅ (${orderData.cart_items.length})` : '❌'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 