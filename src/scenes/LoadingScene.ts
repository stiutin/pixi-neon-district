import {Graphics, Text} from 'pixi.js';

import type {AssetManager} from '../assets/AssetManager';
import {GAME_CONFIG} from '../config/game.config';
import {Scene} from '../core/Scene';
import {THEME} from '../ui/theme';

const BAR = {width: 500, height: 12, radius: 6} as const;

export class LoadingScene extends Scene {
  private readonly progressFill = new Graphics();
  private readonly status: Text;
  private readonly barX = (GAME_CONFIG.width - BAR.width) / 2;
  private readonly barY = GAME_CONFIG.height / 2 + 25;
  private disposed = false;

  constructor(assets: AssetManager, onLoaded: () => void) {
    super();

    const centerX = GAME_CONFIG.width / 2;
    const centerY = GAME_CONFIG.height / 2;
    const title = new Text({
      text: 'NEON DISTRICT',
      style: {
        fill: THEME.colors.text,
        fontFamily: THEME.font,
        fontSize: 46,
        fontWeight: '700',
        letterSpacing: 5,
      },
    });
    title.anchor.set(0.5);
    title.position.set(centerX, centerY - 75);

    const subtitle = new Text({
      text: 'Initializing city systems…',
      style: {
        fill: THEME.colors.textMuted,
        fontFamily: THEME.font,
        fontSize: 17,
      },
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(centerX, centerY - 25);

    const track = new Graphics().roundRect(this.barX, this.barY, BAR.width, BAR.height, BAR.radius).fill(0x1a2434);

    this.status = new Text({
      text: '0%',
      style: {
        fill: THEME.colors.accent,
        fontFamily: THEME.font,
        fontSize: 14,
      },
    });
    this.status.anchor.set(0.5);
    this.status.position.set(centerX, this.barY + 40);

    this.addChild(title, subtitle, track, this.progressFill, this.status);

    assets
      .loadGame((progress) => {
        this.setProgress(progress);
      })
      .then(() => {
        if (!this.disposed) onLoaded();
      })
      .catch((error: unknown) => {
        console.error('[LoadingScene] Failed to load assets:', error);
        if (this.disposed) return;
        this.status.text = 'Failed to load assets. Please reload the page.';
        this.status.style.fill = THEME.colors.danger;
      });
  }

  public update(): void {
    // Loading is promise-driven; nothing to simulate per frame.
  }

  public override dispose(): void {
    this.disposed = true;
    super.dispose();
  }

  private setProgress(progress: number): void {
    if (this.disposed) return;

    const width = Math.max(BAR.height, BAR.width * progress);

    this.progressFill.clear().roundRect(this.barX, this.barY, width, BAR.height, BAR.radius).fill(THEME.colors.accent);
    this.status.text = `${Math.round(progress * 100)}%`;
  }
}
