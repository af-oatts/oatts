#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const sourceDir = path.join(process.cwd(), 'content');
const destDir = path.join(process.cwd(), 'public', 'oatts');

async function copyAndExtractContent() {
  try {
    console.log('Copying content folder...');
    
    // Check if source exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`Error: Source directory ${sourceDir} does not exist`);
      process.exit(1);
    }

    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Remove destination if it exists
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true });
    }

    // Copy recursively
    fs.cpSync(sourceDir, destDir, { recursive: true });
    console.log('✓ Content copied successfully');

    // Extract all zip files and remove the zip copies
    const zipsDir = path.join(destDir, 'content');
    if (fs.existsSync(zipsDir)) {
      console.log('\nExtracting zip files...');
      const files = fs.readdirSync(zipsDir);
      const zipFiles = files.filter(file => file.endsWith('.zip'));

      for (const zipFile of zipFiles) {
        const zipPath = path.join(zipsDir, zipFile);
        const extractPath = path.join(zipsDir, path.basename(zipFile, '.zip'));
        
        console.log(`  Extracting ${zipFile}...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);
        
        // Remove the zip file after extraction
        fs.unlinkSync(zipPath);
        console.log(`  ✓ Extracted to ${path.basename(extractPath)}/ (zip removed)`);
      }

      console.log('\n✓ All zip files extracted successfully');
    } else {
      console.log('No zips found, skipping extraction');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

copyAndExtractContent();