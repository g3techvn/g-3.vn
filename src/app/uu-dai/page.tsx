'use client';

import { useEffect, useState } from 'react';
import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import Image from 'next/image';
import MobilePromotionFeed from '@/components/mobile/MobilePromotionFeed';

interface Promotion {
  id: number;
  created_at: string;
  title: string;
  desc: string;
  image: string;
  youtube_url?: string;
  slug: string;
}

function getTimeAgo(dateString: string) {
  const now = new Date();
  const created = new Date(dateString);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});

  const toggleDescription = (id: number) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch('/api/promotion');
        if (!response.ok) {
          throw new Error('Failed to fetch promotions');
        }
        const data = await response.json();
        setPromotions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <>
      <div className="block md:hidden">
        <MobileHomeHeader />
        <MobilePromotionFeed
          promotions={promotions}
          isLoading={isLoading}
          error={error}
          expandedDescriptions={expandedDescriptions}
          toggleDescription={toggleDescription}
        />
      </div>
      <div className="container mx-auto hidden md:block">
        {/* TODO: Desktop version sẽ render ở đây */}
      </div>
    </>
  );
} 