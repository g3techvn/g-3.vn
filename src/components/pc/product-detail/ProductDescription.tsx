import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';

type BenefitsObject = {
  benefits?: string[];
  bullets?: string[];
};

interface ProductDescriptionProps {
  keyFeatures?: string[];
  benefits?: string[] | BenefitsObject | string;
  instructions?: string[];
  overview?: string;
  content?: string;
}

export function ProductDescription({ 
  keyFeatures = [], 
  benefits = { benefits: [] }, 
  instructions = [],
  overview = '',
  content = ''
}: ProductDescriptionProps) {
  // Function to handle JSONB format for benefits
  const getBenefitItems = (): string[] => {
    if (!benefits) return [];
    
    // Handle format: { "benefits": [...] }
    if (typeof benefits === 'object' && benefits !== null && !Array.isArray(benefits) && 'benefits' in benefits && Array.isArray(benefits.benefits)) {
      return benefits.benefits;
    }
    
    // Handle direct array format
    if (Array.isArray(benefits)) {
      return benefits;
    }
    
    // Handle string format (JSON string)
    if (typeof benefits === 'string') {
      try {
        const parsed = JSON.parse(benefits);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object' && 'benefits' in parsed && Array.isArray(parsed.benefits)) {
          return parsed.benefits;
        }
        return [benefits]; // Return as single item if parsing doesn't yield an array
      } catch (e) {
        return [benefits]; // Not valid JSON, return as a single item
      }
    }
    
    // Legacy format support
    if (typeof benefits === 'object' && benefits !== null && !Array.isArray(benefits) && 'bullets' in benefits && Array.isArray(benefits.bullets)) {
      return benefits.bullets;
    }
    
    return [];
  };

  // Check which tabs have content
  const hasOverview = Boolean(overview || content);
  const hasFeatures = keyFeatures.length > 0;
  const hasBenefits = getBenefitItems().length > 0;
  const hasInstructions = instructions.length > 0;

  // Determine available tabs
  const availableTabs = [
    { id: 'overview', label: 'Tổng quan', hasContent: hasOverview },
    { id: 'features', label: 'Tính năng nổi bật', hasContent: hasFeatures },
    { id: 'benefits', label: 'Lợi ích sử dụng', hasContent: hasBenefits },
    { id: 'guide', label: 'Hướng dẫn sử dụng', hasContent: hasInstructions }
  ].filter(tab => tab.hasContent);

  // Set default tab to first available tab
  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'overview';
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Don't render if there are no tabs with content
  if (availableTabs.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="prose max-w-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
      
      <Tabs.Root 
        defaultValue={defaultTab} 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <Tabs.List className="flex border-b space-x-4 mb-6">
          {availableTabs.map(tab => (
            <Tabs.Trigger 
              key={tab.id}
              value={tab.id} 
              className="px-4 py-2 text-lg font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 relative"
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600"
                  layoutId="activeTabIndicator"
                />
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        
        <div className="relative min-h-[200px] mb-12">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && hasOverview && (
              <motion.div
                key="overview"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="relative w-full"
              >
                <Tabs.Content value="overview" className="data-[state=inactive]:hidden">
                  {content ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <p className="text-gray-600">
                      {overview}
                    </p>
                  )}
                </Tabs.Content>
              </motion.div>
            )}
            
            {activeTab === 'features' && hasFeatures && (
              <motion.div
                key="features"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="relative w-full"
              >
                <Tabs.Content value="features" className="space-y-4 data-[state=inactive]:hidden">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {keyFeatures.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </Tabs.Content>
              </motion.div>
            )}
            
            {activeTab === 'benefits' && hasBenefits && (
              <motion.div
                key="benefits"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="relative w-full"
              >
                <Tabs.Content value="benefits" className="space-y-4 data-[state=inactive]:hidden">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {getBenefitItems().map((benefit: string, index: number) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        dangerouslySetInnerHTML={{ __html: benefit }}
                      />
                    ))}
                  </ul>
                </Tabs.Content>
              </motion.div>
            )}
            
            {activeTab === 'guide' && hasInstructions && (
              <motion.div
                key="guide"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="relative w-full"
              >
                <Tabs.Content value="guide" className="space-y-4 data-[state=inactive]:hidden">
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    {instructions.map((instruction, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {instruction}
                      </motion.li>
                    ))}
                  </ol>
                </Tabs.Content>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </motion.div>
  );
} 