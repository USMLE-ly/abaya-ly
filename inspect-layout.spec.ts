import { test } from '@playwright/test';

test('inspect layout', async ({ page }) => {
  test.setTimeout(60000);
  
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const results = await page.evaluate(() => {
    const d: any = {};
    
    function walkUp(el: Element | null, maxDepth = 15) {
      const nodes: any[] = [];
      let current: Element | null = el;
      let depth = 0;
      while (current && depth < maxDepth) {
        const cs = getComputedStyle(current);
        const rect = current.getBoundingClientRect();
        nodes.push({
          tag: current.tagName,
          id: current.id || '',
          cls: (current.className && typeof current.className === 'string') ? current.className.substring(0, 60) : '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          w: Math.round(rect.width),
          cw: current.clientWidth,
          sw: current.scrollWidth,
          ow: current.offsetWidth,
          disp: cs.display,
          pos: cs.position,
          cssLeft: cs.left,
          cssRight: cs.right,
          tr: cs.transform,
          ov: cs.overflow,
          ovX: cs.overflowX,
          dir: cs.direction,
          p: cs.padding,
        });
        current = current.parentElement;
        depth++;
      }
      return nodes;
    }
    
    d.vp = { w: window.innerWidth, h: window.innerHeight };
    d.htmlDir = document.documentElement.getAttribute('dir');
    
    // HEADER
    const hdr = document.querySelector('header');
    d.header = hdr ? walkUp(hdr) : 'NO';
    
    // HERO - first section
    const sections = document.querySelectorAll('section');
    d.hero = sections.length > 0 ? walkUp(sections[0]) : 'NO';
    
    // CAROUSEL
    const car = document.querySelector('[class*="overflow-x-auto"]');
    if (car) {
      const cs = getComputedStyle(car);
      d.carousel = {
        self: { sl: car.scrollLeft, sw: car.scrollWidth, cw: car.clientWidth, dir: cs.direction, ov: cs.overflow, ovX: cs.overflowX },
        firstCard: car.firstElementChild ? {
          left: Math.round(car.firstElementChild.getBoundingClientRect().left),
          right: Math.round(car.firstElementChild.getBoundingClientRect().right),
        } : null,
        anc: walkUp(car.parentElement, 8),
      };
    }
    
    // RTL on header
    if (hdr) {
      const cs = getComputedStyle(hdr);
      d.rtl = { left: cs.left, right: cs.right, istart: cs.insetInlineStart, iend: cs.insetInlineEnd };
    }
    
    return d;
  });
  
  console.log(JSON.stringify(results, null, 2));
});
