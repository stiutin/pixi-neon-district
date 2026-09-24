/**
 * README screenshots, reproducible from the code.
 *
 *   npm run screenshots                                                       # local production build
 *   BASE_URL=https://stiutin.github.io/pixi-neon-district/ npm run screenshots  # the live site
 *
 * Output: .github/screenshots/*.png (used by the README). Set CHROMIUM_PATH to use a specific browser binary.
 */
import {spawn, spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';

import {chromium, devices} from '@playwright/test';

const OUT = '.github/screenshots';
const live = process.env.BASE_URL;
const base = (live ?? 'http://localhost:4173/').replace(/\/?$/, '/');
mkdirSync(OUT, {recursive: true});

let server;
if (!live) {
  const built = spawnSync('npm', ['run', 'build'], {shell: true, stdio: 'inherit'});
  if (built.status !== 0) {
    process.exit(built.status ?? 1);
  }
  // Own process group, so the whole `npm → vite preview` tree can be stopped at the end.
  server = spawn('npm', ['run', 'serve'], {detached: true, shell: true, stdio: 'ignore'});
  for (
    let attempt = 0;
    attempt < 100 &&
    !(await fetch(base).then(
      () => true,
      () => false
    ));
    attempt++
  ) {
    await sleep(100);
  }
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? {args: ['--no-sandbox'], executablePath: process.env.CHROMIUM_PATH} : {}
);

async function shoot(contextOptions, name, play) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  await page.goto(base);
  await page.locator('canvas').waitFor();
  await page.waitForTimeout(2500); // loading screen and first frames
  await play(page);
  await page.screenshot({path: `${OUT}/${name}.png`});
  await context.close();
  console.log(`✔ ${name}.png`);
}

// Walk from the spawn point towards the first NPC, so the shot shows the city, a prompt and a dialogue line.
await shoot({viewport: {width: 1280, height: 720}}, 'desktop', async (page) => {
  await page.keyboard.down('ArrowLeft');
  await page.waitForTimeout(1000);
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1800);
  await page.keyboard.up('KeyW');
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(600);
});
await shoot({...devices['Pixel 7'], viewport: {width: 780, height: 360}, isMobile: true}, 'mobile', async (page) => {
  await page.waitForTimeout(500);
});

await browser.close();
if (server?.pid) {
  process.kill(-server.pid);
}
