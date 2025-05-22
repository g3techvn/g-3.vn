/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://g-3.vn',
  generateRobotsTxt: true,
  exclude: ['/api/*', '/404', '/500', '/offline', '/gio-hang'], // Exclude routes not needed in sitemap
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://g-3.vn/server-sitemap.xml', // Optional: for dynamic routes fetched at runtime
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/admin/*']
      }
    ]
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000
} 