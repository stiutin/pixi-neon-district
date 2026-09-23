import type { Container } from "pixi.js";
import { swapRemove } from "../utils/array";
import { Particle } from "./Particle";

export class ParticlePool {
  private readonly free: Particle[] = [];
  private readonly active: Particle[] = [];

  constructor(
    private readonly container: Container,
    initialSize = 32,
  ) {
    for (let i = 0; i < initialSize; i++) this.free.push(new Particle());
  }

  public get activeCount(): number {
    return this.active.length;
  }

  public burst(x: number, y: number, count = 10): void {
    for (let i = 0; i < count; i++) {
      const particle = this.free.pop() ?? new Particle();
      particle.spawn(x, y);
      this.active.push(particle);
      this.container.addChild(particle);
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const particle = this.active[i];

      if (!particle) continue;

      particle.update(deltaTime);

      if (particle.isAlive) continue;

      swapRemove(this.active, i);
      this.container.removeChild(particle);
      this.free.push(particle);
    }
  }

  public destroy(): void {
    for (const particle of [...this.active, ...this.free]) particle.destroy();

    this.active.length = 0;
    this.free.length = 0;
  }
}
