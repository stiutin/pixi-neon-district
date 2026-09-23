import { Sprite, type Texture } from "pixi.js";
import { type AABB, aabbFromCenter } from "../math/AABB";
import { GAME_CONFIG } from "../config/game.config";

const { speed, size, hitboxHalfSize } = GAME_CONFIG.player;

export class Player extends Sprite {
  public readonly speed = speed;
  public readonly hitboxHalfSize = hitboxHalfSize;

  constructor(texture: Texture) {
    super(texture);
    this.anchor.set(0.5);
    this.setSize(size.width, size.height);
  }

  public getCollisionBounds(): AABB {
    return aabbFromCenter(this.x, this.y, this.hitboxHalfSize);
  }

  public syncDepth(): void {
    this.zIndex = this.y + size.height / 2;
  }
}
