import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });

try {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('PAGE LOADED');
} catch(e) {
  console.log('GOTO ERROR:', e.message);
  // Try without networkidle
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load', timeout: 15000 });
  console.log('PAGE LOADED (load)');
}

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
        dir: cs.direction, p_: cs.padding,
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
  
  const body = document.body;
  if (body) {
    const cs = getComputedStyle(body);
    d.body = { w: cs.width, dir: cs.direction, m: cs.margin, p: cs.padding, ov: cs.overflow };
  }
  
  const root = document.getElementById('root');
  if (root) {
    const cs = getComputedStyle(root);
    d.root = { w: cs.width, dir: cs.direction };
  }
  
  return d;
});

console.log(JSON.stringify(results, null, 2));
await browser.close();
