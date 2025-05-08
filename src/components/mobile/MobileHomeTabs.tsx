import React, { useState } from 'react';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';

const tabs = [
  'Ghế công thái học',
  'Bàn nâng hạ',
  'Bàn ghế trẻ em',
  'Phụ kiện',
];

const MobileHomeTabs: React.FC = () => {
  const [active, setActive] = useState(0);
  const isVisible = useHeaderVisibility();

  return (
    <div className={`flex overflow-x-auto border-b border-gray-200 bg-white sticky z-20 transition-all duration-200 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
      isVisible ? 'top-[56px]' : 'top-0'
    }`}>
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`flex-1 px-4 py-3 whitespace-nowrap text-sm font-medium transition-colors ${active === idx ? 'text-red-600 border-b-2 border-red-600 ' : 'text-gray-700'}`}
          onClick={() => setActive(idx)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default MobileHomeTabs; 