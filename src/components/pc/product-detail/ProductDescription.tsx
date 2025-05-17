import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductDescription() {
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
                    Ghế công thái học cao cấp G3-TECH là sự kết hợp hoàn hảo giữa thiết kế hiện đại và công nghệ tiên tiến, mang lại trải nghiệm ngồi vượt trội cho người dùng. Sản phẩm được nghiên cứu kỹ lưỡng nhằm hỗ trợ tối đa cho cột sống, giảm thiểu các vấn đề về sức khỏe thường gặp ở dân văn phòng như đau lưng, mỏi cổ, và căng thẳng cơ bắp.
                  </p>
                  <p className="text-gray-600">
                    Với khung ghế chắc chắn, lưới thoáng khí đạt chuẩn quốc tế và các bộ phận điều chỉnh linh hoạt, ghế phù hợp cho nhiều đối tượng sử dụng, từ nhân viên văn phòng, game thủ đến học sinh, sinh viên. Thiết kế tối ưu giúp người dùng duy trì tư thế ngồi đúng, tăng hiệu quả làm việc và học tập trong thời gian dài.
                  </p>
                  <p className="text-gray-600">
                    Ngoài ra, sản phẩm còn được trang bị các tính năng thông minh như tựa đầu 8D, kê tay xoay 360 độ, trượt mâm linh hoạt và cơ chế ngả đa cấp, đáp ứng mọi nhu cầu cá nhân hóa trải nghiệm ngồi.
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
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Hệ thống điều chỉnh độ cao thông minh, phù hợp với nhiều chiều cao bàn làm việc.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Đệm lưng và tựa đầu có thể điều chỉnh linh hoạt, hỗ trợ tối đa cho cột sống cổ và lưng.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Chất liệu lưới Solidmesh USA đạt chứng chỉ OEKO-TEX® STANDARD 100, đảm bảo an toàn và thoáng khí.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Khung chân hợp kim nhôm bền bỉ, chống rỉ sét, chịu tải trọng lớn.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Trượt mâm biên độ 5cm, dễ dàng điều chỉnh vị trí ngồi phù hợp với chiều dài chân.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      Kê tay xoay 360 độ, hỗ trợ tối ưu cho khủy tay khi làm việc, học tập hoặc giải trí.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      Cơ chế ngả lưng đa cấp, giữ khóa an toàn ở từng vị trí, giúp thư giãn hiệu quả.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      Thiết kế hiện đại, màu sắc sang trọng, phù hợp với nhiều không gian nội thất.
                    </motion.li>
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
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Giảm đau lưng, đau vai gáy và các vấn đề về cột sống do ngồi lâu.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Tăng cường sự tập trung và hiệu suất làm việc nhờ tư thế ngồi chuẩn.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Giúp không gian làm việc trở nên chuyên nghiệp, hiện đại hơn.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Dễ dàng vệ sinh, bảo trì và sử dụng lâu dài với độ bền cao.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Phù hợp cho nhiều đối tượng: nhân viên văn phòng, học sinh, sinh viên, game thủ...
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      Chính sách bảo hành và hậu mãi uy tín từ G3-TECH.
                    </motion.li>
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
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Điều chỉnh chiều cao ghế và tựa đầu phù hợp với vóc dáng trước khi sử dụng.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Vệ sinh bề mặt lưới và khung ghế định kỳ bằng khăn mềm, tránh hóa chất tẩy rửa mạnh.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Kiểm tra các khớp xoay, ốc vít định kỳ để đảm bảo an toàn khi sử dụng lâu dài.
                    </motion.li>
                    <motion.li 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Không để ghế tiếp xúc trực tiếp với ánh nắng mặt trời hoặc môi trường ẩm ướt kéo dài.
                    </motion.li>
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