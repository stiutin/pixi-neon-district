import { Container, Graphics } from "pixi.js";
import type { AssetManager } from "../assets/AssetManager";
import { Building } from "../entities/Building";
import { Collectible } from "../entities/Collectible";
import { NPC } from "../entities/NPC";
import { Tree } from "../entities/Tree";
import type { Collider } from "../collision/Collider";
import type { Interactable } from "../interaction/Interactable";
import { SpatialGrid } from "../spatial/SpatialGrid";
import { GAME_CONFIG } from "../config/game.config";
import { LEVEL, type LevelData } from "./level";

const COLORS = {
  ground: 0x0d1119,
  grid: 0x1a2233,
  road: 0x151b26,
  lane: 0x4de3ff,
  edge: 0xff4dd8,
} as const;

export class World extends Container {
  public readonly collisionGrid = new SpatialGrid<Collider>(GAME_CONFIG.spatialCellSize);
  public readonly interactionGrid = new SpatialGrid<Interactable>(GAME_CONFIG.spatialCellSize);

  public readonly groundLayer = new Container();
  public readonly entityLayer = new Container({ sortableChildren: true });
  public readonly effectsLayer = new Container();

  private readonly collectibles: Collectible[] = [];
  private elapsed = 0;

  constructor(
    private readonly assets: AssetManager,
    private readonly level: LevelData = LEVEL,
  ) {
    super();

    this.addChild(this.groundLayer, this.entityLayer, this.effectsLayer);
    this.createGround();
    this.createRoads();
    this.createBuildings();
    this.createTrees();
    this.createNPCs();
    this.createCollectibles();
  }

  public update(deltaTime: number): void {
    this.elapsed += deltaTime;
    for (const collectible of this.collectibles) collectible.animate(this.elapsed);
  }

  public getCollectibles(): readonly Collectible[] {
    return this.collectibles;
  }

  public getCollectedIds(): string[] {
    return this.collectibles.filter((item) => item.isCollected()).map((item) => item.id);
  }

  public getCollectedCount(): number {
    return this.collectibles.reduce((count, item) => count + Number(item.isCollected()), 0);
  }

  public getTotalCollectibles(): number {
    return this.collectibles.length;
  }

  public isComplete(): boolean {
    return this.getCollectedCount() === this.getTotalCollectibles();
  }

  public restoreCollected(ids: ReadonlySet<string>): void {
    for (const collectible of this.collectibles) {
      collectible.setCollected(ids.has(collectible.id));
    }
  }

  private createGround(): void {
    const { width, height } = GAME_CONFIG.world;
    const ground = new Graphics().rect(0, 0, width, height).fill(COLORS.ground);
    const step = 100;

    for (let x = step; x < width; x += step) ground.moveTo(x, 0).lineTo(x, height);
    for (let y = step; y < height; y += step) ground.moveTo(0, y).lineTo(width, y);
    ground.stroke({ color: COLORS.grid, width: 1, alpha: 0.6 });

    this.groundLayer.addChild(ground);
  }

  private createRoads(): void {
    const { width, height } = GAME_CONFIG.world;
    const { roadWidth, roads: layout } = this.level;
    const roads = new Graphics();

    for (const y of layout.horizontal) roads.rect(0, y, width, roadWidth);

    for (const x of layout.vertical) roads.rect(x, 0, roadWidth, height);

    roads.fill(COLORS.road);

    for (const y of layout.horizontal) {
      roads.moveTo(0, y).lineTo(width, y);
      roads.moveTo(0, y + roadWidth).lineTo(width, y + roadWidth);
    }

    for (const x of layout.vertical) {
      roads.moveTo(x, 0).lineTo(x, height);
      roads.moveTo(x + roadWidth, 0).lineTo(x + roadWidth, height);
    }

    roads.stroke({ color: COLORS.edge, width: 2, alpha: 0.35 });

    const dash = 36;
    const gap = 28;
    const half = roadWidth / 2;

    for (const y of layout.horizontal) {
      for (let x = 0; x < width; x += dash + gap) roads.rect(x, y + half - 1.5, dash, 3);
    }

    for (const x of layout.vertical) {
      for (let y = 0; y < height; y += dash + gap) roads.rect(x + half - 1.5, y, 3, dash);
    }

    roads.fill({ color: COLORS.lane, alpha: 0.35 });

    this.groundLayer.addChild(roads);
  }

  private createBuildings(): void {
    const texture = this.assets.getTexture("building");

    for (const data of this.level.buildings) {
      const building = new Building(texture, data);

      this.entityLayer.addChild(building);
      this.collisionGrid.insert(building);
    }
  }

  private createTrees(): void {
    const texture = this.assets.getTexture("tree");

    for (const { x, y } of this.level.trees) {
      const tree = new Tree(texture, x, y);
      this.entityLayer.addChild(tree);
      this.collisionGrid.insert(tree);
    }
  }

  private createNPCs(): void {
    const texture = this.assets.getTexture("npc");

    for (const data of this.level.npcs) {
      const npc = new NPC(texture, data);
      this.entityLayer.addChild(npc);
      this.collisionGrid.insert(npc);
      this.interactionGrid.insert(npc);
    }
  }

  private createCollectibles(): void {
    const texture = this.assets.getTexture("collectible");

    for (const data of this.level.collectibles) {
      const collectible = new Collectible(texture, data);
      this.entityLayer.addChild(collectible);
      this.interactionGrid.insert(collectible);
      this.collectibles.push(collectible);
    }
  }
}
