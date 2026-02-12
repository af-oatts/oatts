#!/usr/bin/env tsx
import { loadExistingCache, saveContentCache } from './util/cache';
import { verboseLog } from './util/logger';
import { copyDirectorySelectively, removeDeletedFiles, collectSourceFiles } from './util/file-operations';
import { processZipFiles } from './util/zip-processor';
import type { CopyStats } from './util/types';
import path from 'path';
import fs from 'fs';



function ensureDirectoriesExist(sourceDir: string, destDir: string) {
  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory ${sourceDir} does not exist`);
    process.exit(1);
  }

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
}

export function copyAndExtractContent(sourceDir: string, destDir: string) : {created: string[], deleted: string[]} {
  try {
    console.log('Copying content...');
    verboseLog('Checking for existing content cache...');

    ensureDirectoriesExist(sourceDir, destDir);

    const existingCache = loadExistingCache(destDir);

    if (existingCache) {
      verboseLog(`✓ Found existing cache with ${existingCache.size} files`);
    } else {
      verboseLog('No existing cache found, will copy all files');
    }

    verboseLog('\nCopying content folder...');
    const stats: CopyStats = { copied: 0, skipped: 0, deleted: 0 };

    copyDirectorySelectively(sourceDir, destDir, sourceDir, destDir, existingCache, stats);

    const currentSourceFiles = collectSourceFiles(sourceDir, sourceDir);

    let deleted = existingCache? removeDeletedFiles(destDir, existingCache, currentSourceFiles) : [];
    stats.deleted = deleted.length;

    verboseLog(`✓ Copy complete: ${stats.copied} copied, ${stats.skipped} skipped, ${stats.deleted} deleted`);

    verboseLog('\nProcessing zip files...');
    const { zipHashes, extractedDirs, zipStats } = processZipFiles(
      sourceDir,
      destDir,
      existingCache
    );
    

    verboseLog('\nGenerating content cache...');
    saveContentCache(destDir, zipHashes, extractedDirs);

    console.log(
      `Summary: ${stats.copied} files copied, ${stats.skipped} files skipped, ` +
      `${stats.deleted} files deleted, ${zipStats.extracted} zips extracted, ${zipStats.skipped} zips skipped`
    );

    return {created: [...extractedDirs], deleted};

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}