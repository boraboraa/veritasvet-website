import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';

async function expectNoNavigationFromTap(page: any, x: number, y: number) {
  const before = page.url();
  await page.mouse.click(x, y);
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(before);
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
