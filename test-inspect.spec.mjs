import { test } from '@playwright/test';

test('inspect layout', async ({ page }) => {
  test.setTimeout(60000);
  
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  console.log('\n====== PAGE LOADED ======');
  
  const results = await page.evaluate(() => {
    const data = {};
    
    function walkUp(el, maxDepth = 15) {
      const nodes = [];
      let current = el;
      let depth = 0;
      while (current && depth < maxDepth) {
        const cs = window.getComputedStyle(current);
        const rect = current.getBoundingClientRect();
        nodes.push({
          tag: current.tagName,
          id: current.id || '',
          class: (current.className && typeof current.className === 'string') ? current.className.substring(0, 60) : '',
          rectLeft: Math.round(rect.left),
          rectRight: Math.round(rect.right),
          rectWidth: Math.round(rect.width),
          clientWidth: current.clientWidth,
          scrollWidth: current.scrollWidth,
          offsetWidth: current.offsetWidth,
          display: cs.display,
          position: cs.position,
          left: cs.left,
          right: cs.right,
          top: cs.top,
          transform: cs.transform,
          overflow: cs.overflow,
          margin: cs.margin,
          padding: cs.padding,
          direction: cs.direction,
        });
        current = current.parentElement;
        depth++;
      }
      return nodes;
    }
    
    data.viewport = { width: window.innerWidth, height: window.innerHeight };
    data.htmlDir = document.documentElement.getAttribute('dir');
    
    const header = document.querySelector('header');
    data.header = header ? walkUp(header) : 'NOT FOUND';
    
    const sections = document.querySelectorAll('section');
    data.hero = sections.length > 0 ? walkUp(sections[0]) : 'NOT FOUND';
    
    const carousel = document.querySelector('[class*="overflow-x-auto"]');
    if (carousel) {
      data.carousel = {
        self: { scrollLeft: carousel.scrollLeft, scrollWidth: carousel.scrollWidth, clientWidth: carousel.clientWidth },
        firstCard: carousel.firstElementChild ? Object.fromEntries(Object.entries(carousel.firstElementChild.getBoundingClientRect()).map(([k,v]) => [k, Math.round(v)])) : null,
        ancestors: walkUp(carousel.parentElement, 8),
      };
    } else {
      data.carousel = 'NOT FOUND';
    }
    
    // RTL check
    const h = document.querySelector('header');
    if (h) {
      const cs = window.getComputedStyle(h);
      data.headerRtl = {
        left: cs.left, right: cs.right,
        insetInlineStart: cs.insetInlineStart, insetInlineEnd: cs.insetInlineEnd,
      };
    }
    
    return data;
  });
  
  console.log(JSON.stringify(results, null, 2));
});
