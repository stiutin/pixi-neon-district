import {Container, Graphics, Text} from 'pixi.js';

import {GAME_CONFIG} from '../config/game.config';
import {THEME} from './theme';

const WIDTH = 640;
const HEIGHT = 84;
const BOTTOM_MARGIN = 38;
const FADE_TIME = 0.25;

export class MessageBanner extends Container {
  private readonly speaker = new Text({
    text: '',
    style: {
      fill: THEME.colors.accentAlt,
      fontFamily: THEME.font,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 1,
    },
  });

  private readonly message = new Text({
    text: '',
    style: {
      fill: THEME.colors.text,
      fontFamily: THEME.font,
      fontSize: 17,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: WIDTH - 60,
    },
  });

  private remaining = 0;

  constructor() {
    super();

    const panel = new Graphics()
      .roundRect(0, 0, WIDTH, HEIGHT, 16)
      .fill({color: THEME.colors.panel, alpha: 0.92})
      .stroke({color: THEME.colors.border, width: 1});

    this.speaker.anchor.set(0.5, 0);
    this.speaker.position.set(WIDTH / 2, 14);
    this.message.anchor.set(0.5);
    this.message.position.set(WIDTH / 2, HEIGHT / 2 + 9);
    this.addChild(panel, this.speaker, this.message);
    this.position.set((GAME_CONFIG.width - WIDTH) / 2, GAME_CONFIG.height - HEIGHT - BOTTOM_MARGIN);
    this.visible = false;
  }

  public show(message: string, speaker = '', duration: number = GAME_CONFIG.ui.messageDuration): void {
    this.speaker.text = speaker.toUpperCase();
    this.speaker.visible = speaker.length > 0;
    this.message.position.y = speaker ? HEIGHT / 2 + 9 : HEIGHT / 2;
    this.message.text = message;
    this.remaining = duration;
    this.alpha = 1;
    this.visible = true;
  }

  public update(deltaTime: number): void {
    if (!this.visible) return;

    this.remaining -= deltaTime;
    this.alpha = Math.min(1, this.remaining / FADE_TIME);

    if (this.remaining <= 0) this.visible = false;
  }
}
