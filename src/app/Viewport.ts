import type { Application } from "pixi.js";

export interface ViewportOptions {
  readonly designWidth: number;
  readonly designHeight: number;
  readonly maxResolution: number;
}

export class Viewport {
  constructor(
    private readonly app: Application,
    private readonly options: ViewportOptions,
  ) {
    window.addEventListener("resize", this.fit);
    window.visualViewport?.addEventListener("resize", this.fit);
    this.fit();
  }

  public destroy(): void {
    window.removeEventListener("resize", this.fit);
    window.visualViewport?.removeEventListener("resize", this.fit);
  }

  private readonly fit = (): void => {
    const { designWidth, designHeight, maxResolution } = this.options;
    const scale = Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight);
    const cssWidth = Math.floor(designWidth * scale);
    const cssHeight = Math.floor(designHeight * scale);
    const resolution = Math.min(
      (cssWidth / designWidth) * (window.devicePixelRatio || 1),
      maxResolution,
    );

    this.app.renderer.resize(designWidth, designHeight, resolution);

    const { style } = this.app.canvas;
    style.width = `${cssWidth}px`;
    style.height = `${cssHeight}px`;
  };
}
