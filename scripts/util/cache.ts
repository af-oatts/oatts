import fs from 'fs';
import path from 'path';
import { calculateFileHash, FileHash } from './hash';
import { deepMap } from './traverse';
import { verboseLog } from './logger';

interface ContentCache {
  generated: string;
  files: FileHash[];
}


export function loadExistingCache(destDir: string): Map<string, string> | null {
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
    verboseLog('Warning: Could not parse existing cache file, will do full copy');
    return null;
  }
}


export function saveContentCache(
  destDir: string,
  zipHashes: FileHash[],
  extractedDirs: Set<string>
): void {
  const nonZipFileHashes = deepMap(destDir, destDir, extractedDirs, (full, relative) => [{
    path: relative,
    hash: calculateFileHash(full),
    size: fs.statSync(full).size
  }]);

  const allHashes = [...zipHashes, ...nonZipFileHashes];

  const cacheData = {
    generated: new Date().toISOString(),
    files: allHashes.sort((a, b) => a.path.localeCompare(b.path))
  };

  const cacheFilePath = path.join(destDir, '.contentcache');
  fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2));

  verboseLog(
    `✓ Content cache created with ${allHashes.length} files ` +
    `(${zipHashes.length} zips, ${nonZipFileHashes.length} other files)`
  );
  verboseLog(`  Cache file: ${cacheFilePath}`);
}