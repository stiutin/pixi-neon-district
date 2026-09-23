import { Sprite, type Texture } from "pixi.js";
import { type AABB, aabbFromCenter } from "../math/AABB";
import type { Collider } from "../collision/Collider";

const TREE_SIZE = 58;
const TRUNK_HALF_SIZE = 9;
const TRUNK_OFFSET_Y = 18;

export class Tree extends Sprite implements Collider {
  private readonly hitbox: AABB;

  constructor(texture: Texture, x: number, y: number) {
    super(texture);
    this.anchor.set(0.5);
    this.setSize(TREE_SIZE, TREE_SIZE);
    this.position.set(x, y);
    this.zIndex = y + TREE_SIZE / 2;
    this.hitbox = aabbFromCenter(x, y + TRUNK_OFFSET_Y, TRUNK_HALF_SIZE);
  }

  public getCollisionBounds(): AABB {
    return this.hitbox;
  }

  public getSpatialBounds(): AABB {
    return this.hitbox;
  }
}
