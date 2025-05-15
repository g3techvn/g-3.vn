import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'product.hstatic.net',
      'congthaihoc.vn',
      'images.unsplash.com',
      'picsum.photos',
      'static.g-3.vn',
      'img.youtube.com',
    ],
  },
};

const galleryImages = [
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&q=80',
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=800&q=80',
  'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=800&q=80',
];

export default nextConfig;
