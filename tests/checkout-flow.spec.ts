import { test, expect, type Page } from "@playwright/test";

const PRODUCT_ID = "lumiere-white-polka-midi";
const PRODUCT_URL = `/product/${PRODUCT_ID}`;
const ORDER_ID = "NAD-TEST01";

const TRACK_ORDER = {
  orderId: ORDER_ID,
  code: "LM26-01",
  name: "Lumière • Céleste • فستان سهرة أبيض بنقاط سوداء كلاسيكية بقصة محدّدة الخصر • إصدار 2026",
  customerName: "نور الهدى",
  color: "أبيض",
  size: "M",
  status: "confirmed",
  statusLabel: "مؤكد",
  createdAt: new Date().toISOString(),
  items: [
    {
      id: PRODUCT_ID,
      name: "فستان سهرة أبيض بنقاط سوداء كلاسيكية بقصة محدّدة الخصر",
      color: "أبيض",
      size: "M",
      quantity: 1,
      price: 840,
    },
  ],
};

/** Stub every API endpoint + external script the storefront touches. */
async function mockNetwork(page: Page) {
  await page.route("**/api/stock", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ stock: {} }) })
  );
  await page.route("**/api/catalog", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ products: [] }) })
  );
  await page.route("**/api/promo", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        promo: { active: false, disabled: true, ended: true, code: "", type: "percent", value: 0, label: "", expiresAt: null },
      }),
    })
  );
  await page.route(/\/api\/reviews(\?.*)?$/, (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reviews: [] }) })
  );
  await page.route("**/api/analytics", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) })
  );
  await page.route(/\/api\/track-order(\?.*)?$/, (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ found: true, order: TRACK_ORDER }),
    })
  );
  // Analytics / third-party scripts must never block or flake the tests.
  await page.route("https://*.googletagmanager.com/**", (r) => r.abort());
  await page.route("https://*.google-analytics.com/**", (r) => r.abort());
}

/** Mock /api/order and capture the posted payload. */
async function mockOrder(page: Page, capture: { sent: any }) {
  await page.route("**/api/order", async (r) => {
    if (r.request().method() !== "POST") {
      return r.fulfill({ status: 404, contentType: "application/json", body: "{}" });
    }
    capture.sent = r.request().postDataJSON();
    return r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ orderId: ORDER_ID, ok: true }),
    });
  });
}

/** Product page → add to cart → cart drawer → booking modal. */
async function openBookingModal(page: Page) {
  await page.goto(PRODUCT_URL);
  await page.getByRole("button", { name: "اضيفي الى السلة" }).click();
  await expect(page.getByRole("button", { name: /إتمام الطلب/ })).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /إتمام الطلب/ }).click();
  await expect(page.getByRole("heading", { name: "حجز الفستان" })).toBeVisible();
}

/** Fill a valid booking and submit. */
async function submitValidBooking(page: Page) {
  await page.getByPlaceholder("مثال: نور الهدى").fill("نور الهدى");
  await page.getByPlaceholder("0912345678").fill("0912345678");
  await page.locator("form select").selectOption("بنغازي");
  await page.getByRole("button", { name: "حجز الطلب" }).click();
}

test("BookingModal rejects invalid submissions before any API call", async ({ page }) => {
  const sent: any[] = [];
  await page.route("**/api/order", async (r) => {
    sent.push(r.request().postData() ?? "");
    if (r.request().method() !== "POST") return r.fulfill({ status: 404, body: "{}" });
    return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ orderId: ORDER_ID }) });
  });
  await mockNetwork(page);
  await openBookingModal(page);

  // 1) Empty form → missing name, nothing sent.
  await page.getByRole("button", { name: "حجز الطلب" }).click();
  await expect(page.getByText("يرجى كتابة الاسم الكريم (من حرفين إلى 60 حرفاً)")).toBeVisible();
  expect(sent).toHaveLength(0);

  // 2) Name filled, phone empty.
  await page.getByPlaceholder("مثال: نور الهدى").fill("نور الهدى");
  await page.getByRole("button", { name: "حجز الطلب" }).click();
  await expect(page.getByText("رقم الهاتف يجب أن يتكون من 10 أرقام")).toBeVisible();
  expect(sent).toHaveLength(0);

  // 3) Phone with a non-Libyan prefix.
  await page.getByPlaceholder("0912345678").fill("0991234567");
  await page.getByRole("button", { name: "حجز الطلب" }).click();
  await expect(page.getByText("رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094")).toBeVisible();
  expect(sent).toHaveLength(0);

  // 4) Valid phone but no city selected.
  await page.getByPlaceholder("0912345678").fill("0912345678");
  await page.getByRole("button", { name: "حجز الطلب" }).click();
  await expect(page.getByText("يرجى اختيار المدينة أو المنطقة")).toBeVisible();
  expect(sent).toHaveLength(0);
});

test("valid booking succeeds and the success card buttons work", async ({ page }) => {
  const capture: { sent: any } = { sent: null };
  await mockNetwork(page);
  await mockOrder(page, capture);
  await openBookingModal(page);
  await submitValidBooking(page);

  // Success card with the real order id.
  await expect(page.getByText(ORDER_ID, { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("link", { name: "تتبعي طلبكِ الآن" })).toBeVisible();
  await expect(page.getByRole("button", { name: "عرض شهادة الأصالة" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "متابعة التسوق" })).toBeVisible();

  // Strict payload reached the API: identity, delivery and per-item lines.
  expect(capture.sent).not.toBeNull();
  expect(capture.sent.customerName).toBe("نور الهدى");
  expect(capture.sent.phone).toBe("0912345678");
  expect(capture.sent.location).toBe("بنغازي");
  expect(capture.sent.whatsappConsent).toBe(true);
  expect(capture.sent.code).toContain(PRODUCT_ID);
  expect(capture.sent.items).toHaveLength(1);
  expect(capture.sent.items[0].id).toBe(PRODUCT_ID);
  expect(capture.sent.items[0].quantity).toBe(1);
  expect(capture.sent.items[0].price).toBeGreaterThan(0);
  expect(capture.sent.finalTotal).toBeGreaterThanOrEqual(0);
  expect(capture.sent.deliveryFee).toBe(0); // Benghazi = free delivery

  // "تتبعي طلبكِ الآن" navigates to the tracking page with prefilled params.
  await page.getByRole("link", { name: "تتبعي طلبكِ الآن" }).click();
  await expect(page).toHaveURL(/\/track-order\?orderNumber=NAD-TEST01&phone=0912345678/);
});

test("certificate modal renders every section and downloads a PDF", async ({ page }) => {
  await mockNetwork(page);
  await mockOrder(page, { sent: null });
  await openBookingModal(page);
  await submitValidBooking(page);

  const certBtn = page.getByRole("button", { name: "عرض شهادة الأصالة" }).first();
  await expect(certBtn).toBeVisible({ timeout: 20_000 });
  await certBtn.click();

  // Certificate sections (store seal / outfit seal layout).
  await expect(page.getByText("سجل التوثيق الرسمي")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("منطقة التوثيق")).toBeVisible();
  await expect(page.getByText("منطقة التكريم")).toBeVisible();
  await expect(page.getByText("NADINE LUXURY · HOUSE CERTIFIED")).toBeVisible();
  await expect(page.getByText("NADINE LUXURY", { exact: false }).first()).toBeVisible();

  // Export actions.
  await expect(page.getByRole("button", { name: "تحميل PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "تحميل الصورة" })).toBeVisible();
  await expect(page.getByRole("button", { name: "مشاركة الشهادة" })).toBeVisible();

  // PDF export works end-to-end.
  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download", { timeout: 45_000 }),
    page.getByRole("button", { name: "تحميل PDF" }).click(),
  ]);
  expect(pdfDownload.suggestedFilename()).toMatch(/^nadine-certificate-NAD-TEST01\.pdf$/);
});

test("tracking page shows the certificate preview before downloading", async ({ page }) => {
  await mockNetwork(page);
  await page.goto(`/track-order?orderNumber=${ORDER_ID}&phone=0912345678`);

  // Auto-search resolves the order → certificate preview section.
  await expect(page.getByRole("heading", { name: "شهادة الأصالة" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("معاينة شهادة التوثيق الخاصة بطلبكِ — جاهزة للتحميل أو المشاركة.")).toBeVisible();
  await expect(page.getByRole("button", { name: "عرض أكبر" })).toBeVisible();

  // The real certificate surface renders inside the preview frame.
  const preview = page.locator('section[aria-label="شهادة الأصالة"]');
  await expect(preview.getByText("سجل التوثيق الرسمي")).toBeVisible();
  await expect(preview.getByText("NADINE LUXURY · HOUSE CERTIFIED")).toBeVisible();

  // PDF download from the preview works end-to-end.
  const [pdfDownload] = await Promise.all([
    page.waitForEvent("download", { timeout: 45_000 }),
    preview.getByRole("button", { name: "تحميل PDF" }).click(),
  ]);
  expect(pdfDownload.suggestedFilename()).toMatch(/^nadine-certificate-NAD-TEST01\.pdf$/);
});
