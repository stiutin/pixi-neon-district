import {expect, type Page, test} from '@playwright/test';

/** Collects uncaught errors and console errors for the whole test. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

test('boots into the game and renders a canvas that fits the window', async ({page}) => {
  const errors = trackErrors(page);
  await page.goto('./');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(page).toHaveTitle('Neon District');
  const box = await canvas.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && Math.max(box.width / viewport.width, box.height / viewport.height)).toBeCloseTo(1, 1);
  expect(errors).toEqual([]);
});

test('handles keyboard input without errors', async ({page, isMobile}) => {
  test.skip(isMobile, 'keyboard');
  const errors = trackErrors(page);
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();

  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) {
    await page.keyboard.down(key);
    await page.waitForTimeout(150);
    await page.keyboard.up(key);
  }
  for (const key of ['KeyE', 'KeyM', 'Escape', 'Escape']) {
    await page.keyboard.press(key);
  }
  expect(errors).toEqual([]);
});

test('keeps progress settings in localStorage', async ({page, isMobile}) => {
  test.skip(isMobile, 'keyboard');
  await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();
  // Input is ignored during the loading scene; toggling sound in the game scene is saved immediately.
  const readSave = () => page.evaluate(() => localStorage.getItem('neon-district-save-v1'));
  await expect
    .poll(async () => {
      if ((await readSave()) === null) {
        await page.keyboard.press('KeyM');
      }
      return readSave();
    })
    .toContain('"soundEnabled":false');
});
