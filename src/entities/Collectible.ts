import { Sprite, type Texture } from "pixi.js";
import { type AABB, aabbFromCenter } from "../math/AABB";
import type { Point } from "../math/Point";
import type { Interactable, InteractionResult } from "../interaction/Interactable";

export interface CollectibleData {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

const SIZE = 32;
const BOB_AMPLITUDE = 5;
const BOB_SPEED = 3;

export class Collectible extends Sprite implements Interactable {
  public readonly id: string;
  private readonly home: Point;
  private readonly hitbox: AABB;
  private readonly baseScale: number;
  private readonly phase: number;
  private collected = false;

  constructor(texture: Texture, data: CollectibleData) {
    super(texture);
    this.id = data.id;
    this.anchor.set(0.5);
    this.baseScale = SIZE / Math.max(texture.width, texture.height, 1);
    this.scale.set(this.baseScale);

    this.home = { x: data.x, y: data.y };
    this.position.set(data.x, data.y);
    this.zIndex = data.y + SIZE / 2;
    this.hitbox = aabbFromCenter(data.x, data.y, SIZE / 2);
    this.phase = data.x * 0.013 + data.y * 0.007;
  }

  public animate(time: number): void {
    if (this.collected) return;
    const t = time * BOB_SPEED + this.phase;
    this.y = this.home.y + Math.sin(t) * BOB_AMPLITUDE;
    this.scale.set(this.baseScale * (1 + Math.sin(t * 2) * 0.06));
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public setCollected(collected: boolean): void {
    this.collected = collected;
    this.visible = !collected;
  }

  public canInteract(): boolean {
    return !this.collected;
  }

  public interact(): InteractionResult {
    this.setCollected(true);
    return { kind: "collected", id: this.id, position: this.home };
  }

  public getInteractionLabel(): string {
    return "Collect shard";
  }

  public getPosition(): Point {
    return this.home;
  }

  public getSpatialBounds(): AABB {
    return this.hitbox;
  }
}
