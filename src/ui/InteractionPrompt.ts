import { Container, Graphics, Text } from "pixi.js";
import { THEME } from "./theme";

const PADDING_X = 14;
const HEIGHT = 44;

export class InteractionPrompt extends Container {
  private readonly panel = new Graphics();
  private readonly labelText = new Text({
    text: "",
    style: {
      fill: THEME.colors.text,
      fontFamily: THEME.font,
      fontSize: 16,
      fontWeight: "600",
    },
  });
  private currentLabel = "";

  constructor() {
    super();
    this.labelText.anchor.set(0, 0.5);
    this.labelText.position.set(PADDING_X, HEIGHT / 2);
    this.addChild(this.panel, this.labelText);
    this.visible = false;
  }

  public show(label: string, key = "E"): void {
    const text = `[ ${key} ]  ${label}`;
    this.visible = true;

    if (text === this.currentLabel) return;

    this.currentLabel = text;
    this.labelText.text = text;
    this.panel
      .clear()
      .roundRect(0, 0, this.labelText.width + PADDING_X * 2, HEIGHT, 12)
      .fill({ color: THEME.colors.panel, alpha: 0.9 })
      .stroke({ color: THEME.colors.accent, width: 1.5 });
  }

  public hide(): void {
    this.visible = false;
  }
}
