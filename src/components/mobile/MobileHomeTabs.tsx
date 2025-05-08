import React, { useState } from 'react';

const tabs = [
  'Ghế công thái học',
  'Bàn nâng hạ',
  'Bàn ghế trẻ em',
  'Phụ kiện',
];

interface MobileHomeTabsProps {
  isHeaderVisible: boolean;
}

const MobileHomeTabs: React.FC<MobileHomeTabsProps> = ({ isHeaderVisible }) => {
  const [active, setActive] = useState(0);

  return (
    <div className={`flex overflow-x-auto border-b border-gray-200 bg-white sticky z-20 transition-all duration-300 ${
      isHeaderVisible ? 'top-[56px]' : 'top-0'
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