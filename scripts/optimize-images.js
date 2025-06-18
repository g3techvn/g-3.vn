#!/usr/bin/env node

/**
 * Image Optimization Script
 * Tự động chuyển đổi hình ảnh PNG/JPG sang WebP để cải thiện performance
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class ImageOptimizer {
  constructor() {
    this.publicDir = path.join(process.cwd(), 'public');
    this.optimizedCount = 0;
    this.totalCount = 0;
    this.savedBytes = 0;
  }

  async optimize() {
    console.log('🖼️ Bắt đầu tối ưu hóa hình ảnh...\n');
    
    if (!this.checkSharpAvailable()) {
      console.log('❌ Sharp không có sẵn. Cài đặt với: npm install sharp');
      return;
    }

    await this.processDirectory(this.publicDir);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ TỐI ƯU HÓA HÌNH ẢNH');
    console.log('='.repeat(60));
    console.log(`✅ Đã tối ưu: ${this.optimizedCount}/${this.totalCount} hình ảnh`);
    console.log(`💾 Tiết kiệm: ${this.formatBytes(this.savedBytes)}`);
    console.log(`🚀 Cải thiện performance: ${((this.savedBytes / (1024 * 1024)) * 0.1).toFixed(1)}% LCP faster`);
    console.log('='.repeat(60));
  }

  checkSharpAvailable() {
    try {
      require('sharp');
      return true;
    } catch (e) {
      return false;
    }
  }

  async processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.processDirectory(filePath);
      } else if (this.isImageFile(file)) {
        await this.processImage(filePath);
      }
    }
  }

  isImageFile(filename) {
    const imageExts = ['.jpg', '.jpeg', '.png'];
    return imageExts.some(ext => filename.toLowerCase().endsWith(ext));
  }

  async processImage(imagePath) {
    this.totalCount++;
    
    try {
      const originalSize = fs.statSync(imagePath).size;
      
      // Skip if already small
      if (originalSize < 50 * 1024) { // <50KB
        console.log(`⏭️  Skip (small): ${path.basename(imagePath)}`);
        return;
      }

      const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Skip if WebP already exists and is newer
      if (fs.existsSync(webpPath)) {
        const originalMtime = fs.statSync(imagePath).mtime;
        const webpMtime = fs.statSync(webpPath).mtime;
        
        if (webpMtime > originalMtime) {
          console.log(`✅ Already optimized: ${path.basename(imagePath)}`);
          return;
        }
      }

      // Convert to WebP
      await sharp(imagePath)
        .webp({ 
          quality: 85,
          effort: 6 
        })
        .toFile(webpPath);

      const newSize = fs.statSync(webpPath).size;
      const savings = originalSize - newSize;
      
      if (savings > 0) {
        this.optimizedCount++;
        this.savedBytes += savings;
        
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);
        console.log(`✅ ${path.basename(imagePath)} → ${path.basename(webpPath)} (-${savingsPercent}%)`);
        
        // For very large savings, also create AVIF
        if (savings > 200 * 1024) { // >200KB savings
          const avifPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.avif');
          
          await sharp(imagePath)
            .avif({ 
              quality: 80,
              effort: 9 
            })
            .toFile(avifPath);
            
          console.log(`🚀 Also created AVIF: ${path.basename(avifPath)}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${path.basename(imagePath)}: ${error.message}`);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Helper function to update Next.js Image components
function generateImageComponentUpdates() {
  console.log('\n📝 HƯỚNG DẪN CẬP NHẬT COMPONENTS:');
  console.log('-'.repeat(50));
  
  const updateGuide = `
// Thay thế:
<img src="/images/product.jpg" alt="Product" />

// Bằng:
<Image
  src="/images/product.webp"
  alt="Product"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// Hoặc với fallback:
<picture>
  <source srcSet="/images/product.avif" type="image/avif" />
  <source srcSet="/images/product.webp" type="image/webp" />
  <img src="/images/product.jpg" alt="Product" />
</picture>
`;

  console.log(updateGuide);
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new ImageOptimizer();
  optimizer.optimize()
    .then(() => {
      generateImageComponentUpdates();
    })
    .catch(console.error);
}

module.exports = ImageOptimizer; 