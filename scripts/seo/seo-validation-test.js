#!/usr/bin/env node

/**
 * SEO Validation Test Script
 * Tests the implementation of 3.1 Technical SEO Enhancement
 * 
 * Usage: node scripts/seo/seo-validation-test.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://g-3.vn';
const TEST_PAGES = [
  '/',
  '/san-pham',
  '/categories',
  '/brands',
  '/lien-he',
  '/about'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SEOValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      info: colors.cyan,
      success: colors.green,
      warning: colors.yellow,
      error: colors.red
    };
    
    console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async testMetadataEnhancements() {
    this.log('🔍 Testing Enhanced Metadata Implementation...', 'info');
    
    try {
      // Check if metadata.ts has enhanced meta tags
      const metadataPath = path.join(process.cwd(), 'src/app/metadata.ts');
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      
      const requiredMetaTags = [
        'alternates',
        'languages',
        'x-default',
        'geo.region',
        'geo.position',
        'business:contact_data',
        'product:retailer',
        'googlebot',
        'apple-mobile-web-app-title',
        'application-name'
      ];
      
      let passed = 0;
      requiredMetaTags.forEach(tag => {
        if (metadataContent.includes(tag)) {
          passed++;
          this.log(`✅ Meta tag '${tag}' found`, 'success');
        } else {
          this.log(`❌ Meta tag '${tag}' missing`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 Metadata Enhancement: ${passed}/${requiredMetaTags.length} checks passed`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing metadata: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  async testSchemaMarkupExpansion() {
    this.log('🏗️ Testing Schema Markup Expansion...', 'info');
    
    try {
      const seoDir = path.join(process.cwd(), 'src/components/SEO');
      
      const requiredSchemas = [
        'ReviewJsonLd.tsx',
        'VideoJsonLd.tsx', 
        'OfferJsonLd.tsx'
      ];
      
      let passed = 0;
      requiredSchemas.forEach(schema => {
        const schemaPath = path.join(seoDir, schema);
        if (fs.existsSync(schemaPath)) {
          passed++;
          this.log(`✅ Schema component '${schema}' found`, 'success');
          
          // Check if component has proper structure
          const content = fs.readFileSync(schemaPath, 'utf8');
          if (content.includes('@context') && content.includes('schema.org')) {
            this.log(`✅ Schema '${schema}' has proper JSON-LD structure`, 'success');
          } else {
            this.log(`⚠️ Schema '${schema}' may have structural issues`, 'warning');
            this.results.warnings++;
          }
        } else {
          this.log(`❌ Schema component '${schema}' missing`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 Schema Expansion: ${passed}/${requiredSchemas.length} components created`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing schema markup: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  async testSEOUtilities() {
    this.log('🛠️ Testing SEO Utilities Implementation...', 'info');
    
    try {
      const seoUtilsPath = path.join(process.cwd(), 'src/lib/utils/seo-utils.ts');
      
      if (!fs.existsSync(seoUtilsPath)) {
        this.log('❌ SEO utilities file not found', 'error');
        this.results.failed++;
        return;
      }
      
      const content = fs.readFileSync(seoUtilsPath, 'utf8');
      
      const requiredFunctions = [
        'generateProductAltTag',
        'generateProductMetaDescription',
        'generateCategoryMetaDescription',
        'generateSEOSlug',
        'generateSEOKeywords',
        'generateOGTitle',
        'validateSEOMetaTags'
      ];
      
      let passed = 0;
      requiredFunctions.forEach(func => {
        if (content.includes(`function ${func}`) || content.includes(`export function ${func}`)) {
          passed++;
          this.log(`✅ SEO utility '${func}' implemented`, 'success');
        } else {
          this.log(`❌ SEO utility '${func}' missing`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 SEO Utilities: ${passed}/${requiredFunctions.length} functions implemented`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing SEO utilities: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  async testRSSFeedImplementation() {
    this.log('📡 Testing RSS Feed Implementation...', 'info');
    
    try {
      const rssFeedPath = path.join(process.cwd(), 'src/app/feed.xml/route.ts');
      
      if (!fs.existsSync(rssFeedPath)) {
        this.log('❌ RSS feed route not found', 'error');
        this.results.failed++;
        return;
      }
      
      const content = fs.readFileSync(rssFeedPath, 'utf8');
      
      const requiredElements = [
        'application/xml',
        'rss version="2.0"',
        'xmlns:atom',
        'channel',
        'title',
        'description',
        'language',
        'lastBuildDate'
      ];
      
      let passed = 0;
      requiredElements.forEach(element => {
        if (content.includes(element)) {
          passed++;
          this.log(`✅ RSS element '${element}' found`, 'success');
        } else {
          this.log(`❌ RSS element '${element}' missing`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 RSS Feed: ${passed}/${requiredElements.length} elements implemented`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing RSS feed: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  async testOptimizedImageEnhancements() {
    this.log('🖼️ Testing OptimizedImage Enhancements...', 'info');
    
    try {
      const imagePath = path.join(process.cwd(), 'src/components/common/OptimizedImage.tsx');
      
      if (!fs.existsSync(imagePath)) {
        this.log('❌ OptimizedImage component not found', 'error');
        this.results.failed++;
        return;
      }
      
      const content = fs.readFileSync(imagePath, 'utf8');
      
      const enhancements = [
        'generateProductAltTag',
        'imageType',
        'features',
        'color',
        'material',
        'seo-utils'
      ];
      
      let passed = 0;
      enhancements.forEach(enhancement => {
        if (content.includes(enhancement)) {
          passed++;
          this.log(`✅ Image enhancement '${enhancement}' found`, 'success');
        } else {
          this.log(`❌ Image enhancement '${enhancement}' missing`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 OptimizedImage: ${passed}/${enhancements.length} enhancements implemented`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing OptimizedImage: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  async testSEOComponentsIndex() {
    this.log('📋 Testing SEO Components Index...', 'info');
    
    try {
      const indexPath = path.join(process.cwd(), 'src/components/SEO/index.ts');
      
      if (!fs.existsSync(indexPath)) {
        this.log('❌ SEO components index not found', 'error');
        this.results.failed++;
        return;
      }
      
      const content = fs.readFileSync(indexPath, 'utf8');
      
      const exports = [
        'ReviewJsonLd',
        'VideoJsonLd',
        'OfferJsonLd',
        'seo-utils'
      ];
      
      let passed = 0;
      exports.forEach(exp => {
        if (content.includes(exp)) {
          passed++;
          this.log(`✅ Export '${exp}' found in index`, 'success');
        } else {
          this.log(`❌ Export '${exp}' missing from index`, 'error');
          this.results.failed++;
        }
      });
      
      this.results.passed += passed;
      this.log(`📊 SEO Index: ${passed}/${exports.length} exports available`, 'info');
      
    } catch (error) {
      this.log(`❌ Error testing SEO index: ${error.message}`, 'error');
      this.results.failed++;
    }
  }

  generateReport() {
    this.log('\n' + '='.repeat(60), 'info');
    this.log('📋 SEO VALIDATION REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    const total = this.results.passed + this.results.failed;
    const percentage = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');
    this.log(`⚠️ Warnings: ${this.results.warnings}`, 'warning');
    this.log(`📊 Success Rate: ${percentage}%`, 'info');
    
    if (percentage >= 90) {
      this.log('🎉 EXCELLENT! SEO implementation is nearly complete', 'success');
    } else if (percentage >= 70) {
      this.log('👍 GOOD! Most SEO features are implemented', 'success');
    } else if (percentage >= 50) {
      this.log('⚠️ NEEDS WORK! Several SEO features are missing', 'warning');
    } else {
      this.log('❌ CRITICAL! Major SEO features are missing', 'error');
    }
    
    this.log('='.repeat(60), 'info');
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'docs/seo-validation-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      percentage: parseFloat(percentage),
      status: percentage >= 90 ? 'excellent' : percentage >= 70 ? 'good' : percentage >= 50 ? 'needs-work' : 'critical'
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`💾 Report saved to: ${reportPath}`, 'info');
  }

  async runAllTests() {
    this.log('🚀 Starting SEO Validation Tests for 3.1 Implementation...', 'info');
    this.log('='.repeat(60), 'info');
    
    await this.testMetadataEnhancements();
    await this.testSchemaMarkupExpansion();
    await this.testSEOUtilities();
    await this.testRSSFeedImplementation();
    await this.testOptimizedImageEnhancements();
    await this.testSEOComponentsIndex();
    
    this.generateReport();
  }
}

// Run the tests
if (require.main === module) {
  const validator = new SEOValidator();
  validator.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = SEOValidator; 