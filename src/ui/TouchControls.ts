import { Container, Graphics, Text } from "pixi.js";
import type { InputAction } from "../input/InputAction";
import type { InputManager } from "../input/InputManager";
import { GAME_CONFIG } from "../config/game.config";
import { THEME } from "./theme";

interface ButtonSpec {
  readonly action: InputAction;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly radius: number;
}

const { width, height } = GAME_CONFIG;
const DPAD = { x: 140, y: height - 116, gap: 50 };

const BUTTONS: readonly ButtonSpec[] = [
  { action: "moveUp", label: "↑", x: DPAD.x, y: DPAD.y - DPAD.gap, radius: 38 },
  {
    action: "moveDown",
    label: "↓",
    x: DPAD.x,
    y: DPAD.y + DPAD.gap,
    radius: 38,
  },
  {
    action: "moveLeft",
    label: "←",
    x: DPAD.x - DPAD.gap,
    y: DPAD.y,
    radius: 38,
  },
  {
    action: "moveRight",
    label: "→",
    x: DPAD.x + DPAD.gap,
    y: DPAD.y,
    radius: 38,
  },
  {
    action: "interact",
    label: "E",
    x: width - 112,
    y: height - 116,
    radius: 46,
  },
  { action: "pause", label: "II", x: width - 48, y: 48, radius: 28 },
  { action: "toggleSound", label: "♪", x: width - 112, y: 48, radius: 28 },
];

export class TouchControls extends Container {
  constructor(private readonly input: InputManager) {
    super();
    this.visible = false;
    for (const spec of BUTTONS) this.addChild(this.createButton(spec));
  }

  public setEnabled(enabled: boolean): void {
    this.visible = enabled;
    this.eventMode = enabled ? "passive" : "none";
  }

  private createButton(spec: ButtonSpec): Container {
    const button = new Container({ eventMode: "static", cursor: "pointer" });
    button.position.set(spec.x, spec.y);

    const background = new Graphics()
      .circle(0, 0, spec.radius)
      .fill({ color: 0x0b1020, alpha: 0.76 })
      .stroke({ color: THEME.colors.accent, width: 2, alpha: 0.8 });

    const label = new Text({
      text: spec.label,
      style: {
        fill: THEME.colors.text,
        fontFamily: THEME.font,
        fontSize: spec.radius * 0.62,
        fontWeight: "700",
      },
    });
    label.anchor.set(0.5);
    button.addChild(background, label);

    const source = `touch:${spec.action}`;
    const press = (): void => {
      this.input.press(spec.action, source);
      button.alpha = 0.55;
    };
    const release = (): void => {
      this.input.release(spec.action, source);
      button.alpha = 1;
    };

    button.on("pointerdown", press);
    button.on("pointerup", release);
    button.on("pointerupoutside", release);
    button.on("pointercancel", release);
    button.on("pointerleave", release);

    return button;
  }
}
