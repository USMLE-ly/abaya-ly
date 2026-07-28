import { chromium } from '@playwright/test';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Start a simple HTTP server
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

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-web-security'] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle', timeout: 15000 });
console.log('PAGE LOADED');

await page.waitForTimeout(2000);

const results = await page.evaluate(() => {
  const d = {};
  d.vp = { w: window.innerWidth, h: window.innerHeight };
  d.htmlDir = document.documentElement.getAttribute('dir');
  
  function walkUp(el, maxDepth = 15) {
    const nodes = [];
    let cur = el;
    let depth = 0;
    while (cur && depth < maxDepth) {
      const cs = getComputedStyle(cur);
      const r = cur.getBoundingClientRect();
      nodes.push({
        tag: cur.tagName, id: cur.id || '',
        l: Math.round(r.left), r_: Math.round(r.right), w: Math.round(r.width),
        cw: cur.clientWidth, sw: cur.scrollWidth,
        d: cs.display, p: cs.position,
        cssL: cs.left, cssR: cs.right,
        tr: cs.transform, ov: cs.overflow,
        dir: cs.direction,
      });
      cur = cur.parentElement;
      depth++;
    }
    return nodes;
  }
  
  const hdr = document.querySelector('header');
  d.header = hdr ? walkUp(hdr) : 'NO';
  
  const secs = document.querySelectorAll('section');
  d.hero = secs[0] ? walkUp(secs[0]) : 'NO';
  
  const car = document.querySelector('[class*="overflow-x-auto"]');
  if (car) {
    const cs = getComputedStyle(car);
    d.carousel = {
      self: { sl: car.scrollLeft, sw: car.scrollWidth, cw: car.clientWidth, dir: cs.direction },
      cards: Array.from(car.children).slice(0, 3).map(c => {
        const r = c.getBoundingClientRect();
        return { l: Math.round(r.left), r_: Math.round(r.right), w: Math.round(r.width) };
      }),
      anc: walkUp(car.parentElement, 8),
    };
  }
  
  if (hdr) {
    const cs = getComputedStyle(hdr);
    d.rtl = { l: cs.left, r: cs.right, istart: cs.insetInlineStart, iend: cs.insetInlineEnd };
  }
  
  return d;
});

console.log(JSON.stringify(results, null, 2));
await browser.close();
server.close();
