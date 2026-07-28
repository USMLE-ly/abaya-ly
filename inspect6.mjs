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

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1000);

// Also test at 390x844 (iPhone 14/15)
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1000);

const results = await page.evaluate(() => {
  const body = document.body;
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    body: { sw: body.scrollWidth, cw: body.clientWidth },
    // Which elements are pushing past the right edge
    overflow: (() => {
      const items = [];
      const all = document.querySelectorAll('*');
      const bRight = body.getBoundingClientRect().right;
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.width > window.innerWidth && r.left < 0) {
          items.push({ tag: el.tagName, cls: (el.className||'').substring(0,40), w: Math.round(r.width), l: Math.round(r.left), r_: Math.round(r.right) });
        }
      }
      return items.slice(0, 10);
    })(),
    // Header position
    header: (() => {
      const h = document.querySelector('header');
      if (!h) return null;
      const r = h.getBoundingClientRect();
      const cs = getComputedStyle(h);
      return { left: r.left, right: r.right, w: r.width, cssL: cs.left, cssR: cs.right };
    })(),
  };
});

console.log(JSON.stringify(results, null, 2));
await browser.close();
server.close();
