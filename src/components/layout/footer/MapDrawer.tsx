'use client';

/// <reference types="@types/google.maps" />
import React, { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon, PhoneIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
// ✅ Optimized Antd import for tree-shaking
import Drawer from 'antd/es/drawer';
import { COMPANY_INFO } from '../../../constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Add Google Maps types
declare global {
  interface Window {
    google: typeof google;
  }
}

interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface MapDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
}

export default function MapDrawer({ isOpen, onClose, location }: MapDrawerProps) {
  // Custom title with right-aligned close button like the cart drawer
  const MapTitle = (
    <div className="flex w-full justify-between items-center">
      <span>{location.name}</span>
      <XMarkIcon 
        className="size-6 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onClose}
      />
    </div>
  );

  return (
    <Drawer
      title={MapTitle}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={384}
      className="map-drawer"
      closeIcon={null} // Hide default close icon
      mask={true}
      maskClosable={true}
      styles={{
        body: {
          paddingBottom: 80,
          overflow: 'auto'
        },
        header: {
          padding: '16px 24px'
        }
      }}
    >
      <div className="space-y-6">
        {/* Location info */}
        <div className="space-y-3">
          <div className="text-sm text-gray-600 leading-relaxed">
            {location.address}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="w-full h-[280px] rounded-lg overflow-hidden relative bg-gray-50 border border-gray-200">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-gray-400 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 text-lg mb-2">{location.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{location.address}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Chỉ đường trên Google Maps
          </a>

          <a
            href={`tel:${COMPANY_INFO.hotline}`}
            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Gọi điện: {COMPANY_INFO.hotline}
          </a>
        </div>

        {/* Store hours and info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Giờ mở cửa: {COMPANY_INFO.workingHours}</span>
          </div>
          <div className="flex items-center text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-600">{COMPANY_INFO.email}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
} 