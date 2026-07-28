# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inspect-layout2.spec.ts >> inspect layout
- Location: inspect-layout2.spec.ts:3:1

# Error details

```
ReferenceError: require is not defined
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://test.local/", waiting until "networkidle"

```

# Test source

```ts
  1   | import { test } from '@playwright/test';
  2   | 
  3   | test('inspect layout', async ({ page }) => {
  4   |   test.setTimeout(60000);
  5   |   
  6   |   // Serve the built files directly via route interception
  7   |   await page.route('**/*', async route => {
  8   |     const url = new URL(route.request().url());
  9   |     let path = url.pathname === '/' || url.pathname === '' ? '/index.html' : url.pathname;
  10  |     const fs = require('fs');
  11  |     const filePath = require('path').join(__dirname, 'dist', path);
  12  |     try {
  13  |       const content = fs.readFileSync(filePath);
  14  |       const ext = filePath.split('.').pop();
  15  |       const types: Record<string, string> = {
  16  |         html: 'text/html', js: 'application/javascript', css: 'text/css',
  17  |         svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg',
  18  |         ico: 'image/x-icon', json: 'application/json',
  19  |       };
  20  |       await route.fulfill({ body: content, contentType: types[ext] || 'text/plain' });
  21  |     } catch {
  22  |       await route.fulfill({ status: 404, body: 'Not found' });
  23  |     }
  24  |   });
  25  |   
  26  |   await page.setViewportSize({ width: 375, height: 812 });
> 27  |   await page.goto('http://test.local/', { waitUntil: 'networkidle', timeout: 15000 });
      |              ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  28  |   await page.waitForTimeout(2000);
  29  |   
  30  |   console.log('\n========== PAGE LOADED ==========');
  31  |   
  32  |   const results = await page.evaluate(() => {
  33  |     const d: any = {};
  34  |     
  35  |     d.vp = { w: window.innerWidth, h: window.innerHeight };
  36  |     d.htmlDir = document.documentElement.getAttribute('dir');
  37  |     
  38  |     function walkUp(el: Element | null, maxDepth = 15) {
  39  |       const nodes: any[] = [];
  40  |       let current: Element | null = el;
  41  |       let depth = 0;
  42  |       while (current && depth < maxDepth) {
  43  |         const cs = getComputedStyle(current);
  44  |         const rect = current.getBoundingClientRect();
  45  |         nodes.push({
  46  |           tag: current.tagName, id: current.id || '',
  47  |           cls: (current.className && typeof current.className === 'string') ? current.className.substring(0, 50) : '',
  48  |           l: Math.round(rect.left), r: Math.round(rect.right), w: Math.round(rect.width),
  49  |           cw: current.clientWidth, sw: current.scrollWidth,
  50  |           disp: cs.display, pos: cs.position, cssL: cs.left, cssR: cs.right,
  51  |           tr: cs.transform, ov: cs.overflow, dir: cs.direction,
  52  |           p: cs.padding, m: cs.margin,
  53  |         });
  54  |         current = current.parentElement;
  55  |         depth++;
  56  |       }
  57  |       return nodes;
  58  |     }
  59  |     
  60  |     const hdr = document.querySelector('header');
  61  |     d.header = hdr ? walkUp(hdr) : 'NO';
  62  |     
  63  |     const sections = document.querySelectorAll('section');
  64  |     d.hero = sections[0] ? walkUp(sections[0]) : 'NO';
  65  |     
  66  |     const car = document.querySelector('[class*="overflow-x-auto"]');
  67  |     if (car) {
  68  |       const cs = getComputedStyle(car);
  69  |       const first = car.firstElementChild;
  70  |       const allCards = Array.from(car.children).slice(0, 3).map(c => {
  71  |         const r = c.getBoundingClientRect();
  72  |         return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) };
  73  |       });
  74  |       d.carousel = {
  75  |         self: { sl: car.scrollLeft, sw: car.scrollWidth, cw: car.clientWidth, dir: cs.direction },
  76  |         firstCard: first ? { l: Math.round(first.getBoundingClientRect().left), r: Math.round(first.getBoundingClientRect().right) } : null,
  77  |         cards: allCards,
  78  |         anc: walkUp(car.parentElement, 8),
  79  |       };
  80  |     }
  81  |     
  82  |     if (hdr) {
  83  |       const cs = getComputedStyle(hdr);
  84  |       d.rtl = { left: cs.left, right: cs.right, istart: cs.insetInlineStart, iend: cs.insetInlineEnd };
  85  |     }
  86  |     
  87  |     // Check body and root
  88  |     const body = document.body;
  89  |     if (body) {
  90  |       const cs = getComputedStyle(body);
  91  |       d.body = { w: cs.width, dir: cs.direction, m: cs.margin, p: cs.padding, ov: cs.overflow, ovX: cs.overflowX };
  92  |     }
  93  |     
  94  |     const root = document.getElementById('root');
  95  |     if (root) {
  96  |       const cs = getComputedStyle(root);
  97  |       d.root = { w: cs.width, dir: cs.direction };
  98  |     }
  99  |     
  100 |     return d;
  101 |   });
  102 |   
  103 |   console.log(JSON.stringify(results, null, 2));
  104 | });
  105 | 
```