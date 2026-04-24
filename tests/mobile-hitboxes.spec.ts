import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

async function expectNoNavigationFromTap(page: any, x: number, y: number) {
  const before = page.url();
  await page.mouse.click(x, y);
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(before);
}

async function inspectTapTarget(page: any, x: number, y: number) {
  return page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const anchor = el.closest('a') as HTMLAnchorElement | null;
    return {
      tag: el.tagName,
      cls: el.className || '',
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      anchorHref: anchor?.getAttribute('href') || null,
      anchorClass: anchor?.className || null
    };
  }, { x, y });
}

test('EN homepage mobile hitboxes', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);

  await expectNoNavigationFromTap(page, 140, 350);
  await expectNoNavigationFromTap(page, 20, 280);

  await page.getByRole('link', { name: /Explore Products/i }).click();
  await expect(page).toHaveURL(/\/products\/$/);
  await page.goBack();

  await page.getByRole('link', { name: /Request Info/i }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await page.goBack();

  const wa = page.locator('a[href*="wa.me"]').first();
  await expect(wa).toHaveAttribute('href', /wa\.me\/32470954643/);
});

test('FR homepage mobile hitboxes', async ({ page }) => {
  await page.goto(`${BASE_URL}/fr/`);
  await expectNoNavigationFromTap(page, 140, 350);
  await expectNoNavigationFromTap(page, 20, 280);
  await expect(page.locator('a[href*="wa.me"]').first()).toHaveAttribute('href', /wa\.me\/32470954643/);
});

test('EN/FR feed-additives card hitboxes', async ({ page }) => {
  await page.goto(`${BASE_URL}/feed-additives/`);
  await page.waitForSelector('#prodsGrid .pc');
  await expectNoNavigationFromTap(page, 10, 620);
  await page.locator('#prodsGrid .pc .pc-title-link').first().click();
  await expect(page).toHaveURL(/\/products\/[^/]+\/$/);

  await page.goto(`${BASE_URL}/fr/feed-additives/`);
  await page.waitForSelector('#prodsGrid .pc');
  await expectNoNavigationFromTap(page, 10, 620);
  await page.locator('#prodsGrid .pc .pc-title-link').first().click();
  await expect(page).toHaveURL(/\/fr\/products\/[^/]+\/$/);
});

test('EN product cards: paragraph taps do not navigate; CTA/title links do', async ({ page }) => {
  await page.goto(`${BASE_URL}/products/`);
  await page.waitForSelector('.prod-card');
  await expectNoNavigationFromTap(page, 180, 525);
  await expectNoNavigationFromTap(page, 24, 560);

  const targetInfo = await inspectTapTarget(page, 180, 525);
  expect(targetInfo?.anchorHref).toBeNull();

  await page.locator('.prod-card-title-link').first().click();
  await expect(page).toHaveURL(/\/feed-additives\.html$/);
  await page.goBack();

  await page.locator('.prod-card-cta').first().click();
  await expect(page).toHaveURL(/\/feed-additives\.html$/);
});

test('FR premix cards: paragraph taps do not navigate; CTA/title links do', async ({ page }) => {
  await page.goto(`${BASE_URL}/fr/premixes/`);
  await page.waitForSelector('.pmx-card');
  await expectNoNavigationFromTap(page, 180, 560);
  await expectNoNavigationFromTap(page, 16, 600);

  const targetInfo = await inspectTapTarget(page, 180, 560);
  expect(targetInfo?.anchorHref).toBeNull();

  await page.locator('.pmx-card-title-link').first().click();
  await expect(page).toHaveURL(/\/fr\/premixes\/versamixx-dairy\/$/);
  await page.goBack();

  await page.locator('.pmx-card-cta').first().click();
  await expect(page).toHaveURL(/\/fr\/premixes\/versamixx-dairy\/$/);
});
