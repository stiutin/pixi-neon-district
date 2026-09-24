import {Container, Graphics, Text} from 'pixi.js';

import {THEME} from './theme';

const {colors, font} = THEME;

export class HUD extends Container {
  private readonly panel = new Graphics()
    .roundRect(0, 0, 245, 74, 14)
    .fill({color: colors.panel, alpha: 0.82})
    .stroke({color: colors.border, width: 1});

  private readonly scoreText = new Text({
    text: '',
    style: {
      fill: colors.text,
      fontFamily: font,
      fontSize: 17,
      fontWeight: '700',
    },
  });

  private readonly fpsText = new Text({
    text: 'FPS --',
    style: {fill: colors.textMuted, fontFamily: font, fontSize: 13},
  });

  private readonly soundText = new Text({
    text: '',
    style: {fill: colors.textMuted, fontFamily: font, fontSize: 13},
  });

  private showKeyHints = true;
  private soundEnabled = true;

  constructor() {
    super();
    this.scoreText.position.set(14, 13);
    this.fpsText.position.set(14, 42);
    this.soundText.anchor.set(1, 0);
    this.soundText.position.set(231, 42);
    this.addChild(this.panel, this.scoreText, this.fpsText, this.soundText);
  }

  public setScore(collected: number, total: number): void {
    this.scoreText.text = `DATA SHARDS  ${collected} / ${total}`;
    this.scoreText.style.fill = collected === total ? colors.accent : colors.text;
  }

  public setFPS(value: number): void {
    this.fpsText.text = `FPS ${Math.round(value)}`;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.renderSound();
  }

  public setShowKeyHints(show: boolean): void {
    this.showKeyHints = show;
    this.renderSound();
  }

  private renderSound(): void {
    const state = this.soundEnabled ? '♪ ON' : '♪ OFF';
    this.soundText.text = this.showKeyHints ? `${state}  [M]` : state;
  }
}
