import { test, expect, type Page } from "@playwright/test";

/**
 * Meta Pixel QA — verifies the client-side debug buffer records events
 * and that the /meta-debug page fires test events end-to-end.
 * Relies only on window.__META_EVENTS__ (no Meta/network dependency).
 */

async function events(page: Page): Promise<unknown[]> {
  return page.evaluate(() => (window as unknown as { __META_EVENTS__?: unknown[] }).__META_EVENTS__ ?? []);
}

async function eventNames(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    ((window as unknown as { __META_EVENTS__?: Array<{ event: string }> }).__META_EVENTS__ ?? []).map((e) => e.event)
  );
}

test("PageView fires into the debug buffer on load", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(async () => (await eventNames(page)).filter((n) => n === "PageView").length, { timeout: 20_000 })
    .toBeGreaterThan(0);
});

test("events carry a shared eventID + payload for CAPI dedup", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(async () => (await events(page)).length, { timeout: 20_000 })
    .toBeGreaterThan(0);
  const buffer = await events(page);
  const pv = buffer.find((e) => (e as { event: string }).event === "PageView") as { eventId?: string; params?: Record<string, unknown> };
  expect(pv).toBeTruthy();
  expect(pv.eventId).toMatch(/^ev_/);
  expect((pv.params as Record<string, unknown>).eventID).toBe(pv.eventId);
});

test("meta-debug page fires test events into the buffer", async ({ page }) => {
  await page.goto("/meta-debug");
  await page.getByRole("button", { name: /fire test events/i }).click();
  await expect
    .poll(async () => (await eventNames(page)).filter((n) => n === "ViewContent").length, { timeout: 10_000 })
    .toBeGreaterThan(0);
  await expect
    .poll(async () => (await eventNames(page)).filter((n) => n === "Purchase").length, { timeout: 10_000 })
    .toBeGreaterThan(0);
  const buffer = await events(page);
  const purchase = buffer.find((e) => (e as { event: string }).event === "Purchase") as {
    params?: Record<string, unknown>;
  };
  expect((purchase.params as Record<string, unknown>).value).toBe(75);
});
