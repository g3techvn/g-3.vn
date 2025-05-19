'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Slot } from '@radix-ui/react-slot';
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

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto set active tab based on current URL
  useEffect(() => {
    const currentPath = window.location.pathname;
    const activeIndex = menuItems.findIndex(item => {
      if (item.href === currentPath) return true;
      if (currentPath === '/' && item.href === '/') return true;
      if (item.href !== '/' && currentPath.startsWith(item.href)) return true;
      return false;
    });
    
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [menuItems]);

  useEffect(() => {
    if (menuItems.length !== 5) {
      console.warn('BottomNav được thiết kế tốt nhất cho 5 menu items. Bạn hiện đang sử dụng ' + menuItems.length + ' items.');
    }
  }, [menuItems]);

  if (!isMobile) return null;

  const handleItemClick = (index: number) => {
    setActiveTab(index);
    menuItems[index].action?.();
  };

  // Function to get the appropriate href with query params if needed
  const getHref = (href: string) => {
    // Add fromNav=true parameter for video page to enable audio
    if (href === '/video') {
      return `${href}?fromNav=true`;
    }
    return href;
  };

  return (
    <div className="navigation">
      <div className="nav-container">
        <ul className="menu-items" role="navigation">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              data-role="NavigationMenuItem"
              className={activeTab === index ? 'active' : ''}
            >
              {item.action ? (
                <a 
                  href="#" 
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(index);
                  }}
                >
                  <span className="icon">
                    {item.icon}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="badge">{item.badgeCount}</span>
                    )}
                  </span>
                  <span className="title">{item.text}</span>
                </a>
              ) : (
                <Link 
                  href={getHref(item.href)} 
                  onClick={(e) => {
                    if (index === activeTab) {
                      e.preventDefault();
                    }
                    handleItemClick(index);
                  }}
                  className="nav-link"
                >
                  <span className="icon">
                    {item.icon}
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="badge">{item.badgeCount}</span>
                    )}
                  </span>
                  <span className="title">{item.text}</span>
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