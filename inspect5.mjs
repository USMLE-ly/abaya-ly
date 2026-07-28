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
await page.waitForTimeout(2000);

// Check horizontal overflow source
const source = await page.evaluate(() => {
  const body = document.body;
  const bLeft = body.getBoundingClientRect().left;
  const bRight = body.getBoundingClientRect().right;
  
  // Find elements that extend beyond body bounds
  const violators = [];
  const all = document.querySelectorAll('*');
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      if (r.right > bRight + 1 || r.left < bLeft - 1) {
        const cs = getComputedStyle(el);
        violators.push({
          tag: el.tagName,
          cls: (el.className && typeof el.className === 'string') ? el.className.substring(0, 30) : '',
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          ov: cs.overflow,
          ovX: cs.overflowX,
          pos: cs.position,
          disp: cs.display,
        });
      }
    }
  }
  // Sort by leftmost position
  violators.sort((a, b) => a.left - b.left);
  return {
    bodyScrollWidth: body.scrollWidth,
    bodyClientWidth: body.clientWidth,
    bodyLeft: Math.round(bLeft),
    bodyRight: Math.round(bRight),
    totalViolators: violators.length,
    firstInLeft: violators.filter(v => v.left < 0).slice(0, 5),
    firstInRight: violators.filter(v => v.right > bRight).slice(0, 5),
  };
});

console.log(JSON.stringify(source, null, 2));

await browser.close();
server.close();
