const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp package...');
  execSync('npm install sharp');
}

const sharp = require('sharp');

// Source logo path
const sourceLogo = path.join(__dirname, 'public', 'images', 'logo-g3.png');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Icon sizes to generate
const iconSizes = [48, 72, 96, 144, 192, 512];

// Generate icons
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  try {
    // Generate regular icons
    for (const size of iconSizes) {
      await sharp(sourceLogo)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `android-launchericon-${size}-${size}.png`));
      
      console.log(`✓ Generated ${size}x${size} icon`);
    }

    // Generate maskable icon (with padding to ensure safe area)
    await sharp(sourceLogo)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .resize(512, 512)
      .png()
      .toFile(path.join(iconsDir, 'maskable-icon-512.png'));
    
    console.log('✓ Generated maskable icon');

    // Create placeholder screenshots if they don't exist
    const mobilePlaceholder = path.join(screenshotsDir, 'mobile-home.png');
    const desktopPlaceholder = path.join(screenshotsDir, 'desktop-home.png');

    // Create resized versions of the logo for screenshots
    const mobileLogoSize = 200;
    const desktopLogoSize = 300;
    const mobileLogoBuffer = await sharp(sourceLogo)
      .resize(mobileLogoSize, mobileLogoSize)
      .toBuffer();

    const desktopLogoBuffer = await sharp(sourceLogo)
      .resize(desktopLogoSize, desktopLogoSize)
      .toBuffer();

    if (!fs.existsSync(mobilePlaceholder)) {
      await sharp({
        create: {
          width: 390,
          height: 844,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([
        {
          input: mobileLogoBuffer,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(mobilePlaceholder);
      
      console.log('✓ Generated mobile screenshot placeholder');
    }

    if (!fs.existsSync(desktopPlaceholder)) {
      await sharp({
        create: {
          width: 1280,
          height: 800,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite([
        {
          input: desktopLogoBuffer,
          gravity: 'center'
        }
      ])
      .png()
      .toFile(desktopPlaceholder);
      
      console.log('✓ Generated desktop screenshot placeholder');
    }

    console.log('All PWA assets have been generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 