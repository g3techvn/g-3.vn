const fs = require('fs');
const path = require('path');

console.log('🔍 G3.VN SEO AUDIT SCRIPT');
console.log('=========================\n');

// Function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Function to count occurrences in file
function countInFile(filePath, searchTerm) {
  const content = readFile(filePath);
  if (!content) return 0;
  return (content.match(new RegExp(searchTerm, 'gi')) || []).length;
}

// Function to check directory contents
function checkDirectory(dirPath) {
  try {
    return fs.readdirSync(dirPath);
  } catch (error) {
    return [];
  }
}

let score = 0;
let maxScore = 0;
const issues = [];
const recommendations = [];

console.log('📋 TECHNICAL SEO CHECKLIST');
console.log('---------------------------');

// 1. Check metadata.ts
maxScore += 10;
if (fileExists('src/app/metadata.ts')) {
  const content = readFile('src/app/metadata.ts');
  if (content.includes('generateMetadata')) {
    score += 10;
    console.log('✅ Metadata management: EXCELLENT');
  } else {
    score += 5;
    console.log('⚠️  Metadata management: PARTIAL');
    issues.push('generateMetadata function not found');
  }
} else {
  console.log('❌ Metadata management: MISSING');
  issues.push('metadata.ts file not found');
}

// 2. Check robots.txt
maxScore += 5;
if (fileExists('public/robots.txt')) {
  const content = readFile('public/robots.txt');
  if (content && content.includes('Sitemap:')) {
    score += 5;
    console.log('✅ Robots.txt: CONFIGURED');
  } else {
    score += 2;
    console.log('⚠️  Robots.txt: BASIC');
    issues.push('robots.txt missing sitemap declarations');
  }
} else {
  console.log('❌ Robots.txt: MISSING');
  issues.push('robots.txt file not found');
}

// 3. Check sitemaps
maxScore += 10;
const sitemapFiles = ['public/sitemap.xml', 'src/app/server-sitemap.xml/route.ts', 'src/app/product-sitemap.xml/route.ts'];
let sitemapScore = 0;
sitemapFiles.forEach(file => {
  if (fileExists(file)) {
    sitemapScore += 3.33;
  }
});

if (sitemapScore >= 10) {
  score += 10;
  console.log('✅ Sitemap architecture: EXCELLENT');
} else if (sitemapScore >= 5) {
  score += 5;
  console.log('⚠️  Sitemap architecture: PARTIAL');
  issues.push('Some sitemap files missing');
} else {
  console.log('❌ Sitemap architecture: POOR');
  issues.push('Sitemap files missing');
}

// 4. Check structured data
maxScore += 15;
const structuredDataFiles = [
  'src/components/SEO/ProductJsonLd.tsx',
  'src/components/SEO/OrganizationJsonLd.tsx',
  'src/components/SEO/BreadcrumbJsonLd.tsx'
];

let structuredDataScore = 0;
structuredDataFiles.forEach(file => {
  if (fileExists(file)) {
    structuredDataScore += 5;
  }
});

if (structuredDataScore >= 15) {
  score += 15;
  console.log('✅ Structured Data: EXCELLENT');
} else if (structuredDataScore >= 10) {
  score += 10;
  console.log('⚠️  Structured Data: GOOD');
  recommendations.push('Add more structured data types');
} else if (structuredDataScore >= 5) {
  score += 5;
  console.log('⚠️  Structured Data: BASIC');
  issues.push('Missing structured data components');
} else {
  score += 0;
  console.log('❌ Structured Data: MISSING');
  issues.push('No structured data found');
}

// 5. Check breadcrumb implementation
maxScore += 5;
if (fileExists('src/components/pc/common/Breadcrumb.tsx')) {
  score += 5;
  console.log('✅ Breadcrumb navigation: IMPLEMENTED');
} else {
  console.log('❌ Breadcrumb navigation: MISSING');
  issues.push('Breadcrumb component not found');
}

// 6. Check image optimization
maxScore += 10;
const imageComponents = checkDirectory('src/components').filter(file => 
  file.includes('Image') || file.includes('image')
);

if (imageComponents.length > 0) {
  const optimizedImageExists = fileExists('src/components/common/OptimizedImage.tsx');
  if (optimizedImageExists) {
    score += 10;
    console.log('✅ Image optimization: EXCELLENT');
  } else {
    score += 5;
    console.log('⚠️  Image optimization: BASIC');
    recommendations.push('Create OptimizedImage component');
  }
} else {
  console.log('❌ Image optimization: POOR');
  issues.push('No image optimization components found');
}

// 7. Check URL structure
maxScore += 5;
const appDir = checkDirectory('src/app');
const dynamicRoutes = appDir.filter(dir => dir.includes('[') && dir.includes(']'));

if (dynamicRoutes.length >= 2) {
  score += 5;
  console.log('✅ URL structure: SEO-FRIENDLY');
} else {
  score += 2;
  console.log('⚠️  URL structure: BASIC');
  recommendations.push('Implement more dynamic routes');
}

// 8. Check performance configuration
maxScore += 10;
if (fileExists('next.config.js')) {
  const content = readFile('next.config.js');
  if (content && content.includes('images')) {
    score += 10;
    console.log('✅ Next.js optimization: CONFIGURED');
  } else {
    score += 5;
    console.log('⚠️  Next.js optimization: BASIC');
    recommendations.push('Add image optimization config');
  }
} else {
  console.log('❌ Next.js optimization: MISSING');
  issues.push('next.config.js not properly configured');
}

// 9. Check PWA configuration
maxScore += 5;
if (fileExists('public/manifest.json')) {
  score += 5;
  console.log('✅ PWA configuration: ENABLED');
} else {
  console.log('❌ PWA configuration: MISSING');
  issues.push('manifest.json not found');
}

// 10. Check content structure
maxScore += 10;
const pages = checkDirectory('src/app').filter(dir => 
  !dir.startsWith('[') && !dir.includes('.') && dir !== 'api'
);

if (pages.length >= 5) {
  score += 10;
  console.log('✅ Content structure: COMPREHENSIVE');
} else if (pages.length >= 3) {
  score += 7;
  console.log('⚠️  Content structure: ADEQUATE');
  recommendations.push('Add more content pages');
} else {
  score += 3;
  console.log('⚠️  Content structure: MINIMAL');
  issues.push('Limited content structure');
}

// 11. Check mobile optimization
maxScore += 10;
const mobileComponents = checkDirectory('src/components/mobile');
if (mobileComponents.length >= 5) {
  score += 10;
  console.log('✅ Mobile optimization: EXCELLENT');
} else if (mobileComponents.length >= 3) {
  score += 7;
  console.log('⚠️  Mobile optimization: GOOD');
  recommendations.push('Add more mobile components');
} else {
  score += 3;
  console.log('⚠️  Mobile optimization: BASIC');
  issues.push('Limited mobile optimization');
}

// 12. Check internal linking
maxScore += 5;
const linkingScore = countInFile('src/components/pc/header/Header.tsx', 'Link') + 
                   countInFile('src/components/mobile/BottomNav.tsx', 'Link');

if (linkingScore >= 10) {
  score += 5;
  console.log('✅ Internal linking: EXCELLENT');
} else if (linkingScore >= 5) {
  score += 3;
  console.log('⚠️  Internal linking: ADEQUATE');
  recommendations.push('Improve internal linking strategy');
} else {
  score += 1;
  console.log('⚠️  Internal linking: POOR');
  issues.push('Limited internal linking');
}

// Calculate final score
const finalScore = Math.round((score / maxScore) * 100);

console.log('\n📊 SEO AUDIT RESULTS');
console.log('====================');
console.log(`Final Score: ${finalScore}/100`);

if (finalScore >= 90) {
  console.log('🏆 Grade: EXCELLENT - Outstanding SEO implementation!');
} else if (finalScore >= 80) {
  console.log('🥇 Grade: VERY GOOD - Great SEO with minor improvements needed');
} else if (finalScore >= 70) {
  console.log('🥈 Grade: GOOD - Solid SEO foundation, some optimization needed');
} else if (finalScore >= 60) {
  console.log('🥉 Grade: FAIR - Basic SEO in place, significant improvements needed');
} else {
  console.log('❌ Grade: POOR - Major SEO work required');
}

// Show issues
if (issues.length > 0) {
  console.log('\n🔴 CRITICAL ISSUES:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue}`);
  });
}

// Show recommendations
if (recommendations.length > 0) {
  console.log('\n💡 RECOMMENDATIONS:');
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

// Priority actions
console.log('\n🎯 PRIORITY ACTIONS:');
console.log('1. Implement structured data (ProductJsonLd, OrganizationJsonLd)');
console.log('2. Optimize meta descriptions for all pages');
console.log('3. Add comprehensive alt tags to images');
console.log('4. Create content marketing strategy');
console.log('5. Setup Google Search Console monitoring');

console.log('\n📈 EXPECTED IMPACT:');
console.log(`Current Score: ${finalScore}/100`);
console.log('Target Score: 85/100 (after implementation)');
console.log('Estimated Timeline: 2-3 months');
console.log('Expected Traffic Increase: +40-60%');

console.log('\n✨ Generated by G3.vn SEO Audit Script');
console.log(`📅 Date: ${new Date().toLocaleDateString('vi-VN')}`); 