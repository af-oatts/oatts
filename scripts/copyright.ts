/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */


import * as fs from "fs";
import * as path from "path";

const COPYRIGHT = `
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */
`;

function hasHeader(content: string): boolean {
  const lines = content.split("\n");
  const start = lines[0].startsWith("#!") ? 1 : 0;
  return lines[start]?.trimStart().startsWith("// Copyright");
}

function injectHeader(content: string): string {
  const lines = content.split("\n");

  if (lines[0].startsWith("#!")) {
    return [lines[0], COPYRIGHT, ...lines.slice(1)].join("\n");
  }

  return [COPYRIGHT, ...lines].join("\n");
}

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkDir(full);
    if (entry.isFile() && /\.tsx?$/.test(entry.name)) return [full];
    return [];
  });
}

function main() {
  const target = process.argv[2];

  if (!target) {
    console.error("Usage: add-copyright.ts <directory>");
    process.exit(1);
  }

  const absTarget = path.resolve(target);

  if (!fs.existsSync(absTarget)) {
    console.error(`Directory not found: ${absTarget}`);
    process.exit(1);
  }

  const files = walkDir(absTarget);
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");

    if (hasHeader(content)) {
      console.log(`  skip  ${file}`);
      skipped++;
      continue;
    }

    fs.writeFileSync(file, injectHeader(content), "utf8");
    console.log(`  wrote ${file}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} already had header.`);
}

main();