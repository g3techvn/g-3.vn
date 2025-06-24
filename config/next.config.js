/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'] // Keep error and warn logs
    } : false,
  },
  images: {
    domains: ['localhost',  'g-3.vn', 'jjraznkvgfsgqrqvlcwo.supabase.co'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hyperwork.vn',
        port: '',
        pathname: '/cdn/**',
      },
      {
        protocol: 'https',
        hostname: 'jjraznkvgfsgqrqvlcwo.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  httpAgentOptions: {
    keepAlive: true,
  },
  experimental: {
    optimizeCss: true,
    // ✅ Enhanced package optimization for bundle size reduction
    optimizePackageImports: ['antd', 'lodash', 'chart.js', 'react-chartjs-2', '@heroicons/react'],
    optimizeServerReact: true,
    serverMinification: true,
  },
  // Disable cache completely in development
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  headers: async () => {
    const headers = []
    
    // Disable cache in development
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
        ],
      })
      
      // Disable cache for static files in development
      headers.push({
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      })
    }
    
    return [
      ...headers,
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },

        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://g-3.vn, https://*.g-3.vn' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      },
      {
        source: '/:path*.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/:path*.css',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  webpack: (config, { isServer, dev }) => {
    // ✅ Enhanced webpack optimization for bundle size reduction
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // 244KB max chunk size
        cacheGroups: {
          // Separate vendor libraries into optimized chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // ✅ Antd optimization - tree-shaken
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: 'antd',
            chunks: 'all',
            priority: 30,
          },
          // ✅ Chart.js lazy loading optimization
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
            name: 'charts',
            chunks: 'async', // Load only when needed
            priority: 20,
          },
          // ✅ Lodash tree-shaking optimization
          lodash: {
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            name: 'lodash',
            chunks: 'all',
            priority: 25,
          },
          // ✅ React optimization
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
          },
        }
      };
    }
    
    return config;
  }
}

export default withBundleAnalyzer(nextConfig); 