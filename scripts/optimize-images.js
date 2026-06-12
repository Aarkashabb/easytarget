#!/usr/bin/env node
/**
 * Convert images to WebP alongside originals.
 * - JPG hero/inline images in hugo/static/images/blog → .webp
 * - PNG workflow diagrams in hugo/static/img/workflows → .webp
 *
 * Keeps originals as <picture> fallback for browsers without WebP.
 * Re-runnable: skips files where .webp is newer than the source.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOTS = [
  { dir: path.join(__dirname, '..', 'hugo', 'static', 'images'), match: /\.jpe?g$/i },
  { dir: path.join(__dirname, '..', 'hugo', 'static', 'img', 'workflows'), match: /\.png$/i },
];

async function walk(dir, match, out = []) {
  let entries;
  try { entries = await fs.promises.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) await walk(fp, match, out);
    else if (match.test(e.name)) out.push(fp);
  }
  return out;
}

(async () => {
  let convertedAll = 0, skippedAll = 0, savedAll = 0;

  for (const { dir, match } of ROOTS) {
    const files = await walk(dir, match);
    if (!files.length) continue;
    console.log(`\n${path.relative(process.cwd(), dir)}: ${files.length} ${match.source} files`);

    for (const src of files) {
      const dst = src.replace(match, '.webp');
      const srcStat = await fs.promises.stat(src);
      const dstStat = await fs.promises.stat(dst).catch(() => null);
      if (dstStat && dstStat.mtimeMs >= srcStat.mtimeMs) {
        skippedAll++;
        continue;
      }

      await sharp(src).webp({ quality: 82, effort: 6 }).toFile(dst);
      const dstBytes = (await fs.promises.stat(dst)).size;
      const saved = srcStat.size - dstBytes;
      savedAll += saved;
      convertedAll++;
      const pct = ((saved / srcStat.size) * 100).toFixed(0);
      const rel = path.relative(dir, src).replace(/\\/g, '/');
      console.log(
        `  ${rel.padEnd(45)} ${(srcStat.size / 1024).toFixed(1).padStart(7)} KB → ${(dstBytes / 1024).toFixed(1).padStart(7)} KB  (-${pct}%)`
      );
    }
  }

  console.log(`\nConverted: ${convertedAll}, Skipped: ${skippedAll}, Total saved: ${(savedAll / 1024).toFixed(1)} KB`);
})();
