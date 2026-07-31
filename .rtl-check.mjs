import { chromium } from "playwright";

const routes = [
  ["home", "/"],
  ["collections", "/collections"],
  ["product", "/product/lumiere-white-polka-midi"],
  ["cart", "/cart"],
  ["wishlist", "/wishlist"],
  ["track-order", "/track-order"],
  ["faq", "/faq"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });

for (const [name, path] of routes) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `/tmp/rtl-shots/${name}.png`, fullPage: false });
  console.log("shot:", name);
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(600);
await page.screenshot({ path: "/tmp/rtl-shots/home-mid.png" });

console.log("JS errors:", errors.length ? errors : "none");
await browser.close();
