#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { calculateFileHash } from './util/hash';
import { verboseLog } from './util/logger';
import yaml from 'yaml';

function shouldSkipFile(filename: string): boolean {
    return filename === 'index.html';
}

function collectFileHashes(
    dir: string,
    baseDir: string,
    hashMap: Map<string, string[]>
): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
            collectFileHashes(fullPath, baseDir, hashMap);
            continue;
        }

        if (!entry.isFile()) continue;
        if (shouldSkipFile(entry.name)) continue;

        const hash = calculateFileHash(fullPath);
        const existing = hashMap.get(hash) || [];
        existing.push(relativePath);
        hashMap.set(hash, existing);
    }
}

function getExistingDeduplicatedHashes(baseDir: string) {
    let map = new Map<string, number>();
    const fullPath = path.join(baseDir, 'repo');
    if (!fs.existsSync(fullPath))
        return map;

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
        const hash = calculateFileHash(path.join(fullPath, entry.name));
        map.set(hash, parseInt(entry.name))
    }
    return map;
}

function determineHashID(hash: string, preExistingHashes: Map<string, number>): { id: number, alreadyExists: boolean } {
    let id = 0;
    for (let [otherHash, otherID] of preExistingHashes.entries()) {
        if (hash === otherHash) {
            return { id: otherID, alreadyExists: true };
        }
        if (otherID > id) {
            id = otherID;
        }
    }
    return { id: id + 1, alreadyExists: false };
}

function pointersToYaml(pointers: { location: string, id: number }[], existingStructure: any = {}): string {
  const structure: any = { ...existingStructure };
  
  pointers.forEach(({ location, id }) => {
    const parts = location.split('/').filter(p => p);
    let current = structure;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = id;
  });
  
  return yaml.stringify(structure);
}

export function deduplicate(
    baseDir: string,
    searchPaths: string[],
    deleted: string[]
): void {
    const hashMap = new Map<string, string[]>();

    if (!fs.existsSync(baseDir)) {
        console.error(`Error: Directory ${baseDir} does not exist`);
        process.exit(1);
    }

    console.log(`Scanning for duplicate files in ${searchPaths.length} path(s)...`);

    for (const searchPath of searchPaths) {
        const fullSearchPath = path.join(baseDir, searchPath);

        if (!fs.existsSync(fullSearchPath)) {
            console.warn(`Warning: Path ${searchPath} does not exist, skipping...`);
            continue;
        }

        collectFileHashes(fullSearchPath, baseDir, hashMap);
    }

    let preExistingHashes = getExistingDeduplicatedHashes(baseDir);

    let pointers: { location: string, id: number }[] = []
    for (let [hash, locations] of hashMap.entries()) {
        const { id, alreadyExists } = determineHashID(hash, preExistingHashes);
        if (locations.length < 3 && !alreadyExists) {
            continue;
        }
        if (!alreadyExists) {
            const repoDir = path.join(baseDir, 'repo');
            if (!fs.existsSync(repoDir)) {
                fs.mkdirSync(repoDir, { recursive: true });
            }
            const sourceFile = path.join(baseDir, locations[0]);
            const destFile = path.join(repoDir, id.toString());
            fs.copyFileSync(sourceFile, destFile);
            console.log(`Creating repo/${id} for hash ${hash}, which is the hash of [${locations.join(", ")}]`);
            preExistingHashes.set(hash, id);
        }

        locations.forEach(location => pointers.push({ location, id }));
    }
    
    const redirectsPath = path.join(process.cwd(), 'src-tauri', 'assets', 'redirects.yml');
    let existingStructure: any = {};

    if (fs.existsSync(redirectsPath)) {
        const existingYaml = fs.readFileSync(redirectsPath, 'utf-8');
        existingStructure = yaml.parse(existingYaml) || {};
    }

    const yml = pointersToYaml(pointers, existingStructure);
    
    const assetsDir = path.dirname(redirectsPath);
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }
    fs.writeFileSync(redirectsPath, yml, 'utf-8');
    console.log(`Updated redirects.yml with ${pointers.length} pointer(s)`);
}