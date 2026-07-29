const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5213;
const DIST = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  let fp = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(fp)) fp = path.join(DIST, 'index.html');
  const ext = path.extname(fp);
  const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
  res.writeHead(200, {'Content-Type': types[ext]||'text/plain'});
  res.end(fs.readFileSync(fp));
});

server.listen(PORT, '127.0.0.1', async () => {
  const b = await chromium.launch({headless:true,args:['--no-sandbox']});
  const ctx = await b.newContext({viewport:{width:390,height:844}});
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${PORT}/`, {waitUntil:'networkidle',timeout:20000});
  await p.waitForTimeout(2000);
  
  // Check carousel card title structure
  const carouselCard = await p.evaluate(() => {
    const scrollEl = document.querySelector('.overflow-x-auto');
    if (!scrollEl) return 'NO CAROUSEL';
    const card = scrollEl.querySelector('[class*="rounded-2xl"]');
    if (!card) return 'NO CARD';
    const ps = card.querySelectorAll('p');
    const h3 = card.querySelector('h3');
    return {
      lines: [...card.children].map(c => c.tagName + ':' + (c.textContent || '').substring(0,60)),
      pCount: ps.length,
      pText: ps.length > 0 ? ps[0].textContent : 'none',
      h3Text: h3 ? h3.textContent : 'none',
    };
  });
  console.log('CAROUSEL CARD:', JSON.stringify(carouselCard, null, 2));

  // Check OutfitGallery card
  const outfitCard = await p.evaluate(() => {
    const section = document.querySelector('section');
    if (!section) return 'NO SECTION';
    const allSections = [...document.querySelectorAll('section')];
    // Find the OutfitGallery section (has title الوصلات الجديدة)
    const outfitSec = allSections.find(s => s.textContent.includes('الوصلات'));
    if (!outfitSec) return 'NO OUTFIT';
    const cards = outfitSec.querySelectorAll('[class*="rounded-2xl"]');
    if (cards.length === 0) return 'NO CARDS';
    const firstCard = cards[0];
    const ps = firstCard.querySelectorAll('p');
    const h3 = firstCard.querySelector('h3');
    return {
      pCount: ps.length,
      firstPText: ps.length > 0 ? ps[0].textContent : 'none',
      h3Text: h3 ? h3.textContent : 'none',
    };
  });
  console.log('OUTFIT CARD:', JSON.stringify(outfitCard, null, 2));
  
  await ctx.close();
  await b.close();
  server.close();
});
