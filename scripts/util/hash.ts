import crypto from 'crypto';
import fs from 'fs';

export interface FileHash {
  path: string;
  hash: string;
  size: number;
}


export function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}