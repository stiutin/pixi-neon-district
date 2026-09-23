import { Sprite, type Texture } from "pixi.js";
import type { AABB } from "../math/AABB";
import type { Collider } from "../collision/Collider";

export interface BuildingData {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export class Building extends Sprite implements Collider {
  private readonly hitbox: AABB;

  constructor(texture: Texture, data: BuildingData) {
    super(texture);
    this.anchor.set(0.5);
    this.setSize(data.width, data.height);
    this.position.set(data.x, data.y);
    this.zIndex = data.y + data.height / 2;

    this.hitbox = {
      x: data.x - data.width / 2,
      y: data.y - data.height / 2,
      width: data.width,
      height: data.height,
    };
  }

  public getCollisionBounds(): AABB {
    return this.hitbox;
  }

  public getSpatialBounds(): AABB {
    return this.hitbox;
  }
}
