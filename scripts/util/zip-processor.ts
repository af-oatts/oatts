import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { calculateFileHash, FileHash } from './hash';
import { verboseLog } from './logger';
import type { ZipStats } from './types';

interface ZipProcessResult {
  zipHashes: FileHash[];
  extractedDirs: Set<string>;
  actuallyExtractedDirs: Set<string>
  zipStats: ZipStats;
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanExistingExtraction(extractPath: string) {
  if (fs.existsSync(extractPath)) {
    fs.rmSync(extractPath, { recursive: true });
  }
}

function getZipFileInfo(sourceZipPath: string, sourceDir: string) {
  const relativeZipPath = path.relative(sourceDir, sourceZipPath).replace(/\\/g, '/');
  const sourceZipHash = calculateFileHash(sourceZipPath);
  const sourceZipStats = fs.statSync(sourceZipPath);

  return {
    relativeZipPath,
    sourceZipHash,
    size: sourceZipStats.size
  };
}

function extractZipFile(
  sourceZipPath: string,
  destDir: string,
  zipFile: string,
  extractDirName: string
): void {
  const destZipPath = path.join(destDir, 'content', zipFile);
  const destZipDir = path.dirname(destZipPath);
  const extractPath = path.join(destDir, 'content', extractDirName);

  ensureDirectoryExists(destZipDir);
  fs.copyFileSync(sourceZipPath, destZipPath);

  cleanExistingExtraction(extractPath);

  const zip = new AdmZip(destZipPath);
  zip.extractAllTo(extractPath, true);

  fs.unlinkSync(destZipPath);

  verboseLog(`  ✓ Extracted to ${extractDirName}/`);
}

function processZipFile(
  zipFile: string,
  sourceZipsDir: string,
  sourceDir: string,
  destDir: string,
  existingCache: Map<string, string> | null
): { hash: FileHash; extractedDir: string; extracted: boolean } {
  const sourceZipPath = path.join(sourceZipsDir, zipFile);
  const extractDirName = path.basename(zipFile, '.zip');
  const extractPath = path.join(destDir, 'content', extractDirName);
  const relativeExtractPath = path.relative(destDir, extractPath).replace(/\\/g, '/');

  const { relativeZipPath, sourceZipHash, size } = getZipFileInfo(sourceZipPath, sourceDir);

  const hash: FileHash = {
    path: relativeZipPath,
    hash: sourceZipHash,
    size
  };

  const cachedHash = existingCache?.get(relativeZipPath);

  if (cachedHash === sourceZipHash) {
    verboseLog(`  ✓ Skipping (unchanged): ${zipFile}`);
    return { hash, extractedDir: relativeExtractPath, extracted: false };
  }

  const cacheStatus = cachedHash 
    ? 'modified' 
    : existingCache 
      ? 'new' 
      : 'no cache';
  verboseLog(`  → Extracting (${cacheStatus}): ${zipFile}`);

  extractZipFile(sourceZipPath, destDir, zipFile, extractDirName);

  return { hash, extractedDir: relativeExtractPath, extracted: true };
}

export function processZipFiles(
  sourceDir: string,
  destDir: string,
  existingCache: Map<string, string> | null
): ZipProcessResult {
  const allZipHashes: FileHash[] = [];
  const extractedDirs = new Set<string>();
  const actuallyExtractedDirs = new Set<string>();
  const zipStats: ZipStats = { extracted: 0, skipped: 0 };

  const sourceZipsDir = path.join(sourceDir, 'content');
  
  if (!fs.existsSync(sourceZipsDir)) {
    return { zipHashes: allZipHashes, extractedDirs, actuallyExtractedDirs, zipStats };
  }

  const sourceFiles = fs.readdirSync(sourceZipsDir);
  const sourceZipFiles = sourceFiles.filter(file => file.endsWith('.zip'));

  if (sourceZipFiles.length === 0) {
    return { zipHashes: allZipHashes, extractedDirs, actuallyExtractedDirs, zipStats };
  }

  for (const zipFile of sourceZipFiles) {
    const result = processZipFile(zipFile, sourceZipsDir, sourceDir, destDir, existingCache);
    
    allZipHashes.push(result.hash);
    extractedDirs.add(result.extractedDir);

    if (result.extracted) {
      zipStats.extracted++;
      actuallyExtractedDirs.add(result.extractedDir);
    } else {
      zipStats.skipped++;
    }
  }

  verboseLog('\n✓ All zip files processed');

  return { zipHashes: allZipHashes, extractedDirs, actuallyExtractedDirs, zipStats };
}