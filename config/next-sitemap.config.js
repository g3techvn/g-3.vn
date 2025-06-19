/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://g-3.vn',
  generateRobotsTxt: true,
  exclude: [
    '/api/*',
    '/404',
    '/500',
    '/offline',
    '/gio-hang',
    '/admin/*',
    '/tai-khoan/*',
    '/checkout/*'
  ],
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://g-3.vn/server-sitemap.xml',
      'https://g-3.vn/product-sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/gio-hang',
          '/checkout/*',
          '/tai-khoan/*',
          '/404',
          '/500',
          '/offline'
        ]
      }
    ]
  },
  // More frequent updates for product pages
  changefreq: 'daily',
  // Higher default priority
  priority: 0.7,
  // Increased sitemap size to handle more URLs
  sitemapSize: 10000,
  // Additional configuration
  autoLastmod: true,
  generateIndexSitemap: true,
  transform: async (config, path) => {
    // Custom transform rules for different types of pages
    const defaultConfig = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }

    // Homepage gets highest priority
    if (path === '') {
      return {
        ...defaultConfig,
        changefreq: 'daily',
        priority: 1.0,
      }
    }

    // Product listing pages get high priority
    if (path.startsWith('/san-pham') || path.startsWith('/categories') || path.startsWith('/brands')) {
      return {
        ...defaultConfig,
        changefreq: 'daily',
        priority: 0.8,
      }
    }

    // Policy and static pages get lower priority
    if (path.startsWith('/noi-dung/')) {
      return {
        ...defaultConfig,
        changefreq: 'monthly',
        priority: 0.5,
      }
    }

    return defaultConfig
  }
} 