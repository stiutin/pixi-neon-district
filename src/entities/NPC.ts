import { Sprite, type Texture } from "pixi.js";
import { type AABB, aabbFromCenter } from "../math/AABB";
import type { Point } from "../math/Point";
import type { Collider } from "../collision/Collider";
import type { Interactable, InteractionResult } from "../interaction/Interactable";

export interface NPCData {
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly lines: readonly string[];
}

const NPC_WIDTH = 44;
const NPC_HEIGHT = 56;

export class NPC extends Sprite implements Collider, Interactable {
  private readonly hitbox: AABB;
  private lineIndex = 0;

  constructor(
    texture: Texture,
    private readonly data: NPCData,
  ) {
    super(texture);
    this.anchor.set(0.5);
    this.setSize(NPC_WIDTH, NPC_HEIGHT);
    this.position.set(data.x, data.y);
    this.zIndex = data.y + NPC_HEIGHT / 2;
    this.hitbox = aabbFromCenter(data.x, data.y, NPC_WIDTH / 2, NPC_HEIGHT / 2);
  }

  public getCollisionBounds(): AABB {
    return this.hitbox;
  }

  public getSpatialBounds(): AABB {
    return this.hitbox;
  }

  public canInteract(): boolean {
    return this.data.lines.length > 0;
  }

  public interact(): InteractionResult {
    const text = this.data.lines[this.lineIndex % this.data.lines.length] ?? "";
    this.lineIndex++;
    return { kind: "dialogue", speaker: this.data.name, text };
  }

  public getInteractionLabel(): string {
    return `Talk to ${this.data.name}`;
  }

  public getPosition(): Point {
    return this.position;
  }
}
