#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AdmZip from 'adm-zip';

const sourceDir = path.join(process.cwd(), 'content');
const destDir = path.join(process.cwd(), 'public', 'oatts');

// Check for verbose flag
const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

interface FileHash {
  path: string;
  hash: string;
  size: number;
}

interface ContentCache {
  generated: string;
  files: FileHash[];
}

function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function loadExistingCache(): Map<string, string> | null {
  const cacheFilePath = path.join(destDir, '.contentcache');
  
  if (!fs.existsSync(cacheFilePath)) {
    return null;
  }
  
  try {
    const cacheData: ContentCache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
    const cacheMap = new Map<string, string>();
    
    for (const file of cacheData.files) {
      cacheMap.set(file.path, file.hash);
    }
    
    return cacheMap;
  } catch (error) {
    if (verbose) {
      console.warn('Warning: Could not parse existing cache file, will do full copy');
    }
    return null;
  }
}

function copyFileSelectively(
  sourcePath: string,
  destPath: string,
  relativePath: string,
  existingCache: Map<string, string> | null
): boolean {
  // Skip .contentcache file
  if (path.basename(destPath) === '.contentcache') {
    return false;
  }
  
  // Skip zip files; they're handled separately
  if (sourcePath.endsWith('.zip')) {
    return false;
  }
  
  // Calculate hash of source file
  const sourceHash = calculateFileHash(sourcePath);
  
  // Check if file exists in destination and hash matches
  if (existingCache && fs.existsSync(destPath)) {
    const cachedHash = existingCache.get(relativePath);
    if (cachedHash === sourceHash) {
      if (verbose) {
        console.log(`  ✓ Skipping (unchanged): ${relativePath}`);
      }
      return false; // Skip, file unchanged
    } else {
      if (verbose) {
        console.log(`  → Copying (modified): ${relativePath}`);
      }
    }
  } else {
    if (verbose) {
      if (existingCache) {
        console.log(`  → Copying (new): ${relativePath}`);
      } else {
        console.log(`  → Copying (no cache): ${relativePath}`);
      }
    }
  }
  
  // Ensure destination directory exists
  const destDirPath = path.dirname(destPath);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }
  
  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  return true; // File was copied
}

function copyDirectorySelectively(
  source: string,
  dest: string,
  baseSourceDir: string,
  baseDest: string,
  existingCache: Map<string, string> | null,
  stats: { copied: number; skipped: number; deleted: number }
) {
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirectorySelectively(sourcePath, destPath, baseSourceDir, baseDest, existingCache, stats);
    } else if (entry.isFile()) {
      const relativePath = path.relative(baseSourceDir, sourcePath).replace(/\\/g, '/');
      const wasCopied = copyFileSelectively(sourcePath, destPath, relativePath, existingCache);
      
      if (wasCopied) {
        stats.copied++;
      } else {
        stats.skipped++;
      }
    }
  }
}

function collectFileHashes(directory: string, baseDir: string, excludeDirs: Set<string> = new Set()): FileHash[] {
  const hashes: FileHash[] = [];
  
  function traverse(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      
      if (entry.isDirectory()) {
        // Skip directories that are zip extractions
        if (!excludeDirs.has(relativePath)) {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        // Skip .contentcache file
        if (entry.name === '.contentcache') {
          continue;
        }
        
        const hash = calculateFileHash(fullPath);
        const stats = fs.statSync(fullPath);
        
        hashes.push({
          path: relativePath,
          hash: hash,
          size: stats.size
        });
      }
    }
  }
  
  traverse(directory);
  return hashes;
}

function removeDeletedFiles(existingCache: Map<string, string>, currentFiles: Set<string>): number {
  let deletedCount = 0;
  
  for (const cachedPath of existingCache.keys()) {
    if (!currentFiles.has(cachedPath)) {
      const fullPath = path.join(destDir, cachedPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        deletedCount++;
        if (verbose) {
          console.log(`  Removed deleted file: ${cachedPath}`);
        }
      }
    }
  }
  
  return deletedCount;
}

async function copyAndExtractContent() {
  try {
    if (!verbose) {
      console.log('Copying content...');
    }
    
    if (verbose) {
      console.log('Checking for existing content cache...');
    }
    
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

    // Load existing cache if available
    const existingCache = loadExistingCache();
    
    if (verbose) {
      if (existingCache) {
        console.log(`✓ Found existing cache with ${existingCache.size} files`);
      } else {
        console.log('No existing cache found, will copy all files');
      }
    }

    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy files selectively
    if (verbose) {
      console.log('\nCopying content folder...');
    }
    const stats = { copied: 0, skipped: 0, deleted: 0 };
    
    copyDirectorySelectively(sourceDir, destDir, sourceDir, destDir, existingCache, stats);
    
    // Collect current source files to detect deletions
    const currentSourceFiles = new Set<string>();
    function collectSourceFiles(dir: string, baseDir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectSourceFiles(fullPath, baseDir);
        } else if (entry.isFile()) {
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
          currentSourceFiles.add(relativePath);
        }
      }
    }
    collectSourceFiles(sourceDir, sourceDir);
    
    // Remove files that no longer exist in source
    if (existingCache) {
      stats.deleted = removeDeletedFiles(existingCache, currentSourceFiles);
    }
    
    if (verbose) {
      console.log(`✓ Copy complete: ${stats.copied} copied, ${stats.skipped} skipped, ${stats.deleted} deleted`);
    }

    // Process zip files - hash them in SOURCE first, only copy and extract if changed
    const allZipHashes: FileHash[] = [];
    const extractedDirs = new Set<string>(); // Track directories that are zip extractions
    let zipStats = { extracted: 0, skipped: 0 };
    
    const sourceZipsDir = path.join(sourceDir, 'content');
    if (fs.existsSync(sourceZipsDir)) {
      if (verbose) {
        console.log('\nProcessing zip files...');
      }
      const sourceFiles = fs.readdirSync(sourceZipsDir);
      const sourceZipFiles = sourceFiles.filter(file => file.endsWith('.zip'));

      for (const zipFile of sourceZipFiles) {
        const sourceZipPath = path.join(sourceZipsDir, zipFile);
        const relativeZipPath = path.relative(sourceDir, sourceZipPath).replace(/\\/g, '/');
        const extractDirName = path.basename(zipFile, '.zip');
        const extractPath = path.join(destDir, 'content', extractDirName);
        const relativeExtractPath = path.relative(destDir, extractPath).replace(/\\/g, '/');
        
        // Track this as an extraction directory
        extractedDirs.add(relativeExtractPath);
        
        // Hash the zip file IN SOURCE
        const sourceZipHash = calculateFileHash(sourceZipPath);
        const sourceZipStats = fs.statSync(sourceZipPath);
        
        // Store the zip hash for the cache (always, whether we extract or not)
        allZipHashes.push({
          path: relativeZipPath,
          hash: sourceZipHash,
          size: sourceZipStats.size
        });
        
        // Check if we've already extracted this exact zip
        const cachedHash = existingCache?.get(relativeZipPath);
        
        if (cachedHash === sourceZipHash) {
          if (verbose) {
            console.log(`  ✓ Skipping (unchanged): ${zipFile}`);
          }
          zipStats.skipped++;
        } else {
          if (verbose) {
            if (cachedHash) {
              console.log(`  → Extracting (modified): ${zipFile}`);
            } else if (existingCache) {
              console.log(`  → Extracting (new): ${zipFile}`);
            } else {
              console.log(`  → Extracting (no cache): ${zipFile}`);
            }
          }
          
          // Copy zip to destination temporarily
          const destZipPath = path.join(destDir, 'content', zipFile);
          const destZipDir = path.dirname(destZipPath);
          if (!fs.existsSync(destZipDir)) {
            fs.mkdirSync(destZipDir, { recursive: true });
          }
          fs.copyFileSync(sourceZipPath, destZipPath);
          
          // Remove existing extraction if it exists
          if (fs.existsSync(extractPath)) {
            fs.rmSync(extractPath, { recursive: true });
          }
          
          // Extract the zip
          const zip = new AdmZip(destZipPath);
          zip.extractAllTo(extractPath, true);
          
          // Remove the zip file after extraction
          fs.unlinkSync(destZipPath);
          
          if (verbose) {
            console.log(`  ✓ Extracted to ${extractDirName}/`);
          }
          zipStats.extracted++;
        }
      }

      if (verbose && sourceZipFiles.length > 0) {
        console.log('\n✓ All zip files processed');
      }
    }

    // Generate content cache - ONLY include zip hashes and non-extracted files
    if (verbose) {
      console.log('\nGenerating content cache...');
    }
    
    const nonZipFileHashes = collectFileHashes(destDir, destDir, extractedDirs);
    
    // Combine ONLY zip hashes and non-extracted file hashes
    const allHashes = [...allZipHashes, ...nonZipFileHashes];
    
    const cacheData = {
      generated: new Date().toISOString(),
      files: allHashes.sort((a, b) => a.path.localeCompare(b.path))
    };
    
    const cacheFilePath = path.join(destDir, '.contentcache');
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));
    
    if (verbose) {
      console.log(`✓ Content cache created with ${allHashes.length} files (${allZipHashes.length} zips, ${nonZipFileHashes.length} other files)`);
      console.log(`  Cache file: ${cacheFilePath}`);
    }
    
    // Print summary when not verbose
    if (!verbose) {
      console.log(`Summary: ${stats.copied} files copied, ${stats.skipped} files skipped, ${stats.deleted} files deleted, ${zipStats.extracted} zips extracted, ${zipStats.skipped} zips skipped`);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

copyAndExtractContent();