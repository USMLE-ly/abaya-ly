import sharp from "sharp";
import { readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "public");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (EXTENSIONS.has(extname(full).toLowerCase())) files.push(full);
  }
  return files;
}

async function main() {
  const images = walk(ROOT);
  console.log(`🔍 Found ${images.length} images to optimize`);
  let converted = 0, skipped = 0;

  for (const img of images) {
    const webpPath = img.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    if (existsSync(webpPath)) { skipped++; continue; }

    const outDir = dirname(webpPath);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    try {
      await sharp(img).webp({ quality: 80, effort: 4 }).toFile(webpPath);
      converted++;
    } catch (err) {
      console.error(`  ❌ ${img}: ${err.message}`);
    }
  }
  console.log(`\n✨ Done! ${converted} converted, ${skipped} skipped (${converted + skipped} total)`);
}

main();
