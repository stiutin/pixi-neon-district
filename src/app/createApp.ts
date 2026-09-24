import {Application} from 'pixi.js';

import {GAME_CONFIG} from '../config/game.config';

export async function createApp(): Promise<Application> {
  const app = new Application();

  await app.init({
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    backgroundColor: GAME_CONFIG.backgroundColor,
    antialias: true,
    autoDensity: false,
    preference: 'webgl',
  });

  app.canvas.setAttribute('role', 'img');
  app.canvas.setAttribute('aria-label', 'Neon District - top-down city exploration game');
  return app;
}
