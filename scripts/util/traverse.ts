import fs from 'fs';
import path from 'path';
export function deepMap<T>(dir: string, baseDir: string, excludeDirs: Set<string>, callback: (fullPath: string, relativePath: string) => T[]) : T[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    let values : T[] = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
            // Skip directories that are zip extractions
            if(excludeDirs.has(relativePath)) 
                continue;
            
            values = [...values, ...deepMap(fullPath, baseDir, excludeDirs, callback)];
            continue;

        } 
        if (entry.isFile()) {
            // Skip .contentcache file
            if (entry.name === '.contentcache') {
                continue;
            }
            values = [...values, ...callback(fullPath, relativePath)];
        }
    }
    return values;
}
