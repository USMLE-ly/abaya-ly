import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(distDir, filePath);
  try {
    const content = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
console.log(`Server on port ${port}`);

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(2000);

// Find the element causing overflow
const overflow = await page.evaluate(() => {
  const results = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // Check if this element is wider than viewport
    if (rect.width > window.innerWidth + 1) {
      results.push({
        tag: el.tagName,
        id: el.id || '',
        cls: (el.className && typeof el.className === 'string') ? el.className.substring(0, 40) : '',
        w: Math.round(rect.width),
        vp: window.innerWidth,
        display: cs.display,
        overflow: cs.overflow,
        overflowX: cs.overflowX,
      });
    }
  }
  return results.slice(0, 20);
});

console.log('\n=== ELEMENTS WIDER THAN VIEWPORT ===');
console.log(JSON.stringify(overflow, null, 2));

if (overflow.length === 0) {
  // Check what's causing the extra scrollWidth on body
  const bodyInfo = await page.evaluate(() => {
    // Use scrollWidth by checking each child
    const results = [];
    const body = document.body;
    for (const child of body.children) {
      const r = child.getBoundingClientRect();
      const cs = getComputedStyle(child);
      results.push({
        tag: child.tagName,
        id: child.id || '',
        cls: (child.className && typeof child.className === 'string') ? child.className.substring(0, 60) : '',
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        margin: cs.margin,
        padding: cs.padding,
      });
    }
    return results;
  });
  console.log('\n=== BODY CHILDREN ===');
  console.log(JSON.stringify(bodyInfo, null, 2));
  
  // Check root children
  const rootInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return null;
    const results = [];
    for (const child of root.children) {
      const r = child.getBoundingClientRect();
      results.push({
        tag: child.tagName,
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
    return results;
  });
  console.log('\n=== ROOT CHILDREN ===');
  console.log(JSON.stringify(rootInfo, null, 2));
}

await browser.close();
server.close();
