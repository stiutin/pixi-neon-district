import './styles/global.css';

import {createApp} from './app/createApp';
import {Game} from './app/Game';

async function bootstrap(): Promise<void> {
  const host = document.getElementById('app');
  if (!host) throw new Error('Mount element "#app" was not found');

  const app = await createApp();
  host.replaceChildren(app.canvas);

  new Game(app).start();
}

function renderFatalError(): void {
  const main = document.createElement('main');
  main.className = 'fatal-error';
  main.innerHTML =
    '<h1>Neon District failed to start</h1>' +
    '<p>Your browser may not support WebGL. Try reloading the page or using a different browser.</p>';
  document.body.replaceChildren(main);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  renderFatalError();
});
