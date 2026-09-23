import { Container } from "pixi.js";

export abstract class Scene extends Container {
  public abstract update(deltaTime: number): void;

  public dispose(): void {
    this.destroy({ children: true });
  }
}
