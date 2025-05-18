import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';

interface ProductFeaturesProps {
  keyFeatures?: string[];
  benefits?: string[];
  instructions?: string[];
}

export function ProductFeatures({
  keyFeatures = [],
  benefits = [],
  instructions = []
}: ProductFeaturesProps) {
  const [activeTab, setActiveTab] = useState('features');

  // Skip rendering if all arrays are empty
  if (keyFeatures.length === 0 && benefits.length === 0 && instructions.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mt-4 pb-4">
      <h2 className="text-lg font-semibold mb-2">Tính năng sản phẩm</h2>
      
      <Tabs.Root 
        defaultValue="features" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <Tabs.List className="flex space-x-2 border-b mb-4">
          {keyFeatures.length > 0 && (
            <Tabs.Trigger 
              value="features" 
              className="px-3 py-2 text-sm font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
            >
              Tính năng nổi bật
            </Tabs.Trigger>
          )}
          
          {benefits.length > 0 && (
            <Tabs.Trigger 
              value="benefits" 
              className="px-3 py-2 text-sm font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
            >
              Lợi ích sử dụng
            </Tabs.Trigger>
          )}
          
          {instructions.length > 0 && (
            <Tabs.Trigger 
              value="instructions" 
              className="px-3 py-2 text-sm font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
            >
              Hướng dẫn sử dụng
            </Tabs.Trigger>
          )}
        </Tabs.List>
        
        {keyFeatures.length > 0 && (
          <Tabs.Content value="features" className="data-[state=inactive]:hidden">
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-1">
              {keyFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </Tabs.Content>
        )}
        
        {benefits.length > 0 && (
          <Tabs.Content value="benefits" className="data-[state=inactive]:hidden">
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 pl-1">
              {benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </Tabs.Content>
        )}
        
        {instructions.length > 0 && (
          <Tabs.Content value="instructions" className="data-[state=inactive]:hidden">
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 pl-1">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </div>
  );
} 