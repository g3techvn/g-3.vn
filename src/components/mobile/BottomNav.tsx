'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './bottomNav.css';

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  isImage: boolean;
  text: string;
  action?: () => void;
  badgeCount?: number;
}

interface BottomNavProps {
  menuItems: MenuItem[];
  defaultActiveTab?: number;
}

const BottomNav: React.FC<BottomNavProps> = ({ menuItems, defaultActiveTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [isMobile, setIsMobile] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto set active tab based on current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const activeIndex = menuItems.findIndex(item => {
      if (item.href === currentPath) return true;
      // Handle root path
      if (currentPath === '/' && item.href === '/') return true;
      // Handle nested paths
      if (item.href !== '/' && currentPath.startsWith(item.href)) return true;
      return false;
    });
    
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [menuItems]);

  // Kiểm tra số lượng menuItems
  useEffect(() => {
    if (menuItems.length !== 5) {
      console.warn('BottomNav được thiết kế tốt nhất cho 5 menu items. Bạn hiện đang sử dụng ' + menuItems.length + ' items.');
    }
  }, [menuItems]);

  // If not mobile, don't render
  if (!isMobile) {
    return null;
  }

  // Xử lý khi click vào menu item
  const handleItemClick = (index: number) => {
    setActiveTab(index);
    
    if (menuItems[index].action) {
      menuItems[index].action?.();
    }
  };

  return (
    <div className="navigation" ref={navigationRef}>
      <div className="nav-container">
        <ul className="menu-items">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`list ${activeTab === index ? 'active' : ''}`}
            >
              {item.action ? (
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(index);
                }}>
                  <span className="icon">
                    {item.icon}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="badge">{item.badgeCount}</span>
                    )}
                  </span>
                  <span className="title">
                    {item.text}
                  </span>
                </a>
              ) : (
                <Link 
                  href={item.href} 
                  onClick={(e) => {
                    if (index === activeTab) {
                      e.preventDefault();
                    }
                    handleItemClick(index);
                  }}
                >
                  <span className="icon">
                    {item.icon}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="badge">{item.badgeCount}</span>
                    )}
                  </span>
                  <span className="title">
                    {item.text}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BottomNav; 