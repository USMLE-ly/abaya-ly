import { test } from '@playwright/test';

test('inspect layout', async ({ page }) => {
  test.setTimeout(60000);
  
  // Serve the built files directly via route interception
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    let path = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
    const fs = require('fs');
    const filePath = require('path').join(__dirname, 'dist', path);
    try {
      const content = fs.readFileSync(filePath);
      const ext = filePath.split('.').pop();
      const types: Record<string, string> = {
        html: 'text/html', js: 'application/javascript', css: 'text/css',
        svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg',
        ico: 'image/x-icon', json: 'application/json',
      };
      await route.fulfill({ body: content, contentType: types[ext] || 'text/plain' });
    } catch {
      await route.fulfill({ status: 404, body: 'Not found' });
    }
  });
  
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://test.local/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  console.log('\n========== PAGE LOADED ==========');
  
  const results = await page.evaluate(() => {
    const d: any = {};
    
    d.vp = { w: window.innerWidth, h: window.innerHeight };
    d.htmlDir = document.documentElement.getAttribute('dir');
    
    function walkUp(el: Element | null, maxDepth = 15) {
      const nodes: any[] = [];
      let current: Element | null = el;
      let depth = 0;
      while (current && depth < maxDepth) {
        const cs = getComputedStyle(current);
        const rect = current.getBoundingClientRect();
        nodes.push({
          tag: current.tagName, id: current.id || '',
          cls: (current.className && typeof current.className === 'string') ? current.className.substring(0, 50) : '',
          l: Math.round(rect.left), r: Math.round(rect.right), w: Math.round(rect.width),
          cw: current.clientWidth, sw: current.scrollWidth,
          disp: cs.display, pos: cs.position, cssL: cs.left, cssR: cs.right,
          tr: cs.transform, ov: cs.overflow, dir: cs.direction,
          p: cs.padding, m: cs.margin,
        });
        current = current.parentElement;
        depth++;
      }
      return nodes;
    }
    
    const hdr = document.querySelector('header');
    d.header = hdr ? walkUp(hdr) : 'NO';
    
    const sections = document.querySelectorAll('section');
    d.hero = sections[0] ? walkUp(sections[0]) : 'NO';
    
    const car = document.querySelector('[class*="overflow-x-auto"]');
    if (car) {
      const cs = getComputedStyle(car);
      const first = car.firstElementChild;
      const allCards = Array.from(car.children).slice(0, 3).map(c => {
        const r = c.getBoundingClientRect();
        return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) };
      });
      d.carousel = {
        self: { sl: car.scrollLeft, sw: car.scrollWidth, cw: car.clientWidth, dir: cs.direction },
        firstCard: first ? { l: Math.round(first.getBoundingClientRect().left), r: Math.round(first.getBoundingClientRect().right) } : null,
        cards: allCards,
        anc: walkUp(car.parentElement, 8),
      };
    }
    
    if (hdr) {
      const cs = getComputedStyle(hdr);
      d.rtl = { left: cs.left, right: cs.right, istart: cs.insetInlineStart, iend: cs.insetInlineEnd };
    }
    
    // Check body and root
    const body = document.body;
    if (body) {
      const cs = getComputedStyle(body);
      d.body = { w: cs.width, dir: cs.direction, m: cs.margin, p: cs.padding, ov: cs.overflow, ovX: cs.overflowX };
    }
    
    const root = document.getElementById('root');
    if (root) {
      const cs = getComputedStyle(root);
      d.root = { w: cs.width, dir: cs.direction };
    }
    
    return d;
  });
  
  console.log(JSON.stringify(results, null, 2));
});
