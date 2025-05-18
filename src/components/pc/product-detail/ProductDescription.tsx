import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDescriptionProps {
  keyFeatures?: string[];
  benefits?: string[];
  instructions?: string[];
  overview?: string;
}

export function ProductDescription({ 
  keyFeatures = [], 
  benefits = [], 
  instructions = [],
  overview = ''
}: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = React.useState('overview');

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

  return (
    <motion.div 
      className="prose max-w-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
      
      <Tabs.Root 
        defaultValue="overview" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <Tabs.List className="flex border-b space-x-4 mb-6">
          <Tabs.Trigger 
            value="overview" 
            className="px-4 py-2 text-lg font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 relative"
          >
            Tổng quan
            {activeTab === 'overview' && (
              <motion.div
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600"
                layoutId="activeTabIndicator"
              />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="features" 
            className="px-4 py-2 text-lg font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 relative"
          >
            Tính năng nổi bật
            {activeTab === 'features' && (
              <motion.div
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600"
                layoutId="activeTabIndicator"
              />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="benefits" 
            className="px-4 py-2 text-lg font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 relative"
          >
            Lợi ích sử dụng
            {activeTab === 'benefits' && (
              <motion.div
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600"
                layoutId="activeTabIndicator"
              />
            )}
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="guide" 
            className="px-4 py-2 text-lg font-medium data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600 relative"
          >
            Hướng dẫn sử dụng
            {activeTab === 'guide' && (
              <motion.div
                className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600"
                layoutId="activeTabIndicator"
              />
            )}
          </Tabs.Trigger>
        </Tabs.List>
        
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="absolute w-full"
              >
                <Tabs.Content value="overview" className="space-y-4 data-[state=inactive]:hidden">
                  <p className="text-gray-600">
                    {overview}
                  </p>
                </Tabs.Content>
              </motion.div>
            )}
            
            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="absolute w-full"
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
            
            {activeTab === 'benefits' && (
              <motion.div
                key="benefits"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="absolute w-full"
              >
                <Tabs.Content value="benefits" className="space-y-4 data-[state=inactive]:hidden">
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    {benefits.map((benefit, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </Tabs.Content>
              </motion.div>
            )}
            
            {activeTab === 'guide' && (
              <motion.div
                key="guide"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabContentVariants}
                className="absolute w-full"
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