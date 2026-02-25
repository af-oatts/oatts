import fs from 'fs';
import path from 'path';
import { calculateFileHash } from './hash';
import { verboseLog } from './logger';
import type { CopyStats } from './types';

function shouldSkipFile(filePath: string): boolean {
  const basename = path.basename(filePath);
  if (basename === '.contentcache') return true;
  
  if (filePath.endsWith('.zip')) return true;
  return false;
}

function copyFileSelectively(
  sourcePath: string,
  destPath: string,
  relativePath: string,
  existingCache: Map<string, string> | null
): boolean {
  if (shouldSkipFile(destPath)) {
    return false;
  }

  const sourceHash = calculateFileHash(sourcePath);

  if (existingCache && fs.existsSync(destPath)) {
    const cachedHash = existingCache.get(relativePath);
    if (cachedHash === sourceHash) {
      verboseLog(`  ✓ Skipping (unchanged): ${relativePath}`);
      return false;
    }
    verboseLog(`  → Copying (modified): ${relativePath}`);
  } else {
    const cacheStatus = existingCache ? 'new' : 'no cache';
    verboseLog(`  → Copying (${cacheStatus}): ${relativePath}`);
  }

  const destDirPath = path.dirname(destPath);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }

  fs.copyFileSync(sourcePath, destPath);
  return true;
}

export function copyDirectorySelectively(
  source: string,
  dest: string,
  baseSourceDir: string,
  baseDest: string,
  existingCache: Map<string, string> | null,
  stats: CopyStats
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
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = path.relative(baseSourceDir, sourcePath).replace(/\\/g, '/');
    const wasCopied = copyFileSelectively(sourcePath, destPath, relativePath, existingCache);

    if (wasCopied) {
      stats.copied++;
    } else {
      stats.skipped++;
    }
  }
}

export function collectSourceFiles(dir: string, baseDir: string): Set<string> {
  const files = new Set<string>();
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = collectSourceFiles(fullPath, baseDir);
      subFiles.forEach(file => files.add(file));
      continue;
    }

    if (!entry.isFile()) continue;

    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    files.add(relativePath);
  }

  return files;
}

export function removeDeletedFiles(
  destDir: string,
  existingCache: Map<string, string>,
  currentFiles: Set<string>
): string[] {
  let deleted = []

  for (const cachedPath of existingCache.keys()) {
    if (currentFiles.has(cachedPath)) continue;
    if (cachedPath.startsWith('repo/')) continue;

    const fullPath = path.join(destDir, cachedPath);
    if (!fs.existsSync(fullPath)) continue;

    fs.unlinkSync(fullPath);
    deleted.push(cachedPath);
    verboseLog(`  Removed deleted file: ${cachedPath}`);
  }

  return deleted;
}