import {Container, Graphics, Text} from 'pixi.js';

import {GAME_CONFIG} from '../config/game.config';
import {THEME} from './theme';

const WIDTH = 520;
const HEIGHT = 260;

export class Overlay extends Container {
  private readonly title = new Text({
    text: '',
    style: {
      fill: THEME.colors.text,
      fontFamily: THEME.font,
      fontSize: 38,
      fontWeight: '700',
      letterSpacing: 2,
      align: 'center',
    },
  });

  private readonly body = new Text({
    text: '',
    style: {
      fill: THEME.colors.textSoft,
      fontFamily: THEME.font,
      fontSize: 17,
      lineHeight: 28,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: WIDTH - 70,
    },
  });

  constructor() {
    super();

    const {width, height} = GAME_CONFIG;
    const left = (width - WIDTH) / 2;
    const top = (height - HEIGHT) / 2;
    const backdrop = new Graphics().rect(0, 0, width, height).fill({color: 0x000000, alpha: 0.45});
    const panel = new Graphics()
      .roundRect(left, top, WIDTH, HEIGHT, 24)
      .fill({color: THEME.colors.panel, alpha: 0.94})
      .stroke({color: THEME.colors.accent, width: 2, alpha: 0.8});

    this.title.anchor.set(0.5);
    this.title.position.set(width / 2, top + 66);
    this.body.anchor.set(0.5);
    this.body.position.set(width / 2, top + 160);
    this.addChild(backdrop, panel, this.title, this.body);
    this.visible = false;
  }

  public show(title: string, body: string): void {
    this.title.text = title;
    this.body.text = body;
    this.visible = true;
  }

  public hide(): void {
    this.visible = false;
  }
}
