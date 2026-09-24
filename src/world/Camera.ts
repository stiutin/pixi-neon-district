import type {Container} from 'pixi.js';

import {clamp} from '../math/clamp';
import type {Point} from '../math/Point';

export interface Size {
  readonly width: number;
  readonly height: number;
}

export class Camera {
  private x = 0;
  private y = 0;

  constructor(
    private readonly world: Container,
    private readonly viewport: Size,
    private readonly bounds: Size,
    private readonly smoothing: number
  ) {}

  public snapTo(target: Point): void {
    [this.x, this.y] = this.getClampedOffset(target);
    this.apply();
  }

  public update(target: Point, deltaTime: number): void {
    const [targetX, targetY] = this.getClampedOffset(target);
    const factor = 1 - Math.exp(-this.smoothing * deltaTime);

    this.x += (targetX - this.x) * factor;
    this.y += (targetY - this.y) * factor;
    this.apply();
  }

  private getClampedOffset(target: Point): [number, number] {
    const minX = Math.min(0, this.viewport.width - this.bounds.width);
    const minY = Math.min(0, this.viewport.height - this.bounds.height);
    return [clamp(this.viewport.width / 2 - target.x, minX, 0), clamp(this.viewport.height / 2 - target.y, minY, 0)];
  }

  private apply(): void {
    this.world.position.set(this.x, this.y);
  }
}
