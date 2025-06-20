import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    question: "Ghế công thái học phù hợp cho đối tượng nào?",
    answer: "Ghế phù hợp cho nhân viên văn phòng, học sinh, sinh viên, game thủ và bất kỳ ai cần ngồi lâu."
  },
  {
    question: "Bảo hành sản phẩm trong bao lâu?",
    answer: "Sản phẩm được bảo hành 12 tháng cho phần cơ khí và 6 tháng cho lưới."
  },
  {
    question: "Có hỗ trợ lắp đặt tại nhà không?",
    answer: "G3-TECH hỗ trợ lắp đặt miễn phí tại Hà Nội và TP. Hồ Chí Minh."
  },
  {
    question: "Sản phẩm có thể tùy chỉnh như thế nào?",
    answer: "Sản phẩm có thể điều chỉnh chiều cao, tựa đầu, tựa lưng, các tay và góc ngả giúp phù hợp với mọi tư thế và nhu cầu sử dụng."
  },
  {
    question: "Chất liệu lưới có bị bám bụi không?",
    answer: "Chất liệu lưới Solidmesh USA có khả năng chống bám bụi tốt và dễ dàng vệ sinh bằng khăn ẩm."
  }
];

export function FAQ() {
  const [openItem, setOpenItem] = React.useState<string | undefined>();

  const handleValueChange = (value: string) => {
    setOpenItem(value === openItem ? undefined : value);
  };

  return (
    <motion.div 
      className="mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h2>
      
      <Accordion.Root 
        type="single" 
        collapsible 
        className="space-y-4"
        value={openItem}
        onValueChange={handleValueChange}
      >
        {FAQS.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Accordion.Item 
              value={`item-${index}`}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50">
                  {faq.question}
                  <motion.div
                    animate={{ rotate: openItem === `item-${index}` ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </Accordion.Trigger>
              </Accordion.Header>
              <AnimatePresence>
                {openItem === `item-${index}` && (
                  <Accordion.Content asChild forceMount>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: "auto", 
                        opacity: 1,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.3, delay: 0.1 }
                        } 
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: 0.3 },
                          opacity: { duration: 0.2 }
                        } 
                      }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        className="px-4 py-3 text-gray-700"
                        initial={{ y: 10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  </Accordion.Content>
                )}
              </AnimatePresence>
            </Accordion.Item>
          </motion.div>
        ))}
      </Accordion.Root>
    </motion.div>
  );
} 