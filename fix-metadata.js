const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all page files in the app directory
const findFiles = () => {
  const pageFiles = glob.sync('src/app/**/page.tsx');
  const layoutFiles = glob.sync('src/app/**/layout.tsx');
  return [...pageFiles, ...layoutFiles];
};

// Function to update a file's metadata
const updateMetadataInFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file has metadata with viewport or themeColor
  if (!content.includes('metadata') || 
      (!content.includes('viewport') && !content.includes('themeColor'))) {
    return false;
  }
  
  console.log(`Processing ${filePath}`);
  
  let updatedContent = content;
  let hasChanges = false;
  
  // Add Viewport import if needed
  if (!updatedContent.includes('import type { Metadata, Viewport }') && 
      updatedContent.includes('import type { Metadata }')) {
    updatedContent = updatedContent.replace(
      'import type { Metadata }',
      'import type { Metadata, Viewport }'
    );
    hasChanges = true;
  } else if (!updatedContent.includes('Viewport') && updatedContent.includes('metadata')) {
    // Add imports if needed
    if (updatedContent.includes('import { Metadata }')) {
      updatedContent = updatedContent.replace(
        'import { Metadata }',
        'import { Metadata, Viewport }'
      );
      hasChanges = true;
    } else if (updatedContent.includes('import type { Metadata }')) {
      updatedContent = updatedContent.replace(
        'import type { Metadata }',
        'import type { Metadata, Viewport }'
      );
      hasChanges = true;
    } else if (!updatedContent.includes('import') || !updatedContent.includes('next')) {
      // If no imports from 'next', add it
      const importStatement = "import type { Metadata, Viewport } from 'next';\n";
      
      // Find a good place to add the import
      const lines = updatedContent.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import ') && !lines[i].includes('//')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
        updatedContent = lines.join('\n');
        hasChanges = true;
      } else {
        // If no imports found, add at the top
        updatedContent = importStatement + updatedContent;
        hasChanges = true;
      }
    }
  }
  
  // Check if there's metadata with viewport or themeColor
  const metadataMatch = updatedContent.match(/export\s+const\s+metadata(\:\s*\w+)?\s*=\s*\{[^}]*?(?:viewport|themeColor)[^}]*?\}/s);
  
  if (metadataMatch) {
    // Extract viewport and themeColor values
    let viewportValue = null;
    let themeColorValue = null;
    
    // Match viewport
    const viewportMatch = metadataMatch[0].match(/viewport\s*:\s*['"]([^'"]*)['"]/);
    if (viewportMatch) {
      viewportValue = viewportMatch[1];
    }
    
    // Match themeColor
    const themeColorMatch = metadataMatch[0].match(/themeColor\s*:\s*['"]([^'"]*)['"]/);
    if (themeColorMatch) {
      themeColorValue = themeColorMatch[1];
    }
    
    // If we found either viewport or themeColor
    if (viewportValue || themeColorValue) {
      // Remove viewport and themeColor from metadata
      let cleanedMetadata = metadataMatch[0]
        .replace(/,?\s*viewport\s*:\s*['"][^'"]*['"]/g, '')
        .replace(/,?\s*themeColor\s*:\s*['"][^'"]*['"]/g, '')
        .replace(/,\s*}/g, '\n}')
        .replace(/{\s*,/g, '{');
      
      // Create viewport export
      let viewportExport = '';
      if (viewportValue || themeColorValue) {
        viewportExport = `export const viewport: Viewport = {\n`;
        
        if (viewportValue) {
          // Parse the viewport value
          const width = viewportValue.match(/width=([^,]*)/);
          const initialScale = viewportValue.match(/initial-scale=([^,]*)/);
          const maximumScale = viewportValue.match(/maximum-scale=([^,]*)/);
          
          if (width) viewportExport += `  width: '${width[1]}',\n`;
          if (initialScale) viewportExport += `  initialScale: ${initialScale[1]},\n`;
          if (maximumScale) viewportExport += `  maximumScale: ${maximumScale[1]},\n`;
        }
        
        if (themeColorValue) {
          viewportExport += `  themeColor: '${themeColorValue}',\n`;
        }
        
        viewportExport += `};\n\n`;
      }
      
      // Insert the viewport export before the metadata export
      updatedContent = updatedContent.replace(
        metadataMatch[0],
        `${viewportExport}${cleanedMetadata}`
      );
      
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✓ Updated ${filePath}`);
    return true;
  }
  
  return false;
};

const main = () => {
  const files = findFiles();
  console.log(`Found ${files.length} files to check`);
  
  let updatedCount = 0;
  
  files.forEach(file => {
    if (updateMetadataInFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`Updated ${updatedCount} files`);
};

main(); 