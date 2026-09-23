import type { BuildingData } from "../entities/Building";
import type { CollectibleData } from "../entities/Collectible";
import type { NPCData } from "../entities/NPC";
import type { Point } from "../math/Point";

export interface LevelData {
  readonly roads: {
    readonly horizontal: readonly number[];
    readonly vertical: readonly number[];
  };
  readonly roadWidth: number;
  readonly buildings: readonly BuildingData[];
  readonly trees: readonly Point[];
  readonly npcs: readonly NPCData[];
  readonly collectibles: readonly CollectibleData[];
}

export const LEVEL: LevelData = {
  roadWidth: 150,
  roads: {
    horizontal: [420, 1030, 1580],
    vertical: [650, 1450, 2320],
  },
  buildings: [
    { x: 300, y: 200, width: 280, height: 180 },
    { x: 900, y: 300, width: 350, height: 220 },
    { x: 1600, y: 150, width: 300, height: 250 },
    { x: 2100, y: 600, width: 400, height: 250 },
    { x: 400, y: 1420, width: 340, height: 230 },
    { x: 1750, y: 1400, width: 420, height: 240 },
  ],
  trees: [
    { x: 700, y: 150 },
    { x: 1300, y: 700 },
    { x: 1800, y: 500 },
    { x: 2400, y: 300 },
    { x: 500, y: 900 },
    { x: 2700, y: 1250 },
    { x: 1150, y: 1600 },
  ],
  npcs: [
    {
      name: "Vex",
      x: 1200,
      y: 500,
      lines: [
        "The metro station is east of here.",
        "Five data shards went dark tonight. Bring them back online.",
      ],
    },
    {
      name: "Kira",
      x: 1850,
      y: 850,
      lines: [
        "Be careful around the industrial district.",
        "I saw something glowing near the eastern block.",
      ],
    },
    {
      name: "Old Tomo",
      x: 700,
      y: 1200,
      lines: ["I lost something around the park.", "Shards hum when you get close. Listen."],
    },
  ],
  collectibles: [
    { id: "shard-01", x: 450, y: 700 },
    { id: "shard-02", x: 1050, y: 900 },
    { id: "shard-03", x: 1450, y: 500 },
    { id: "shard-04", x: 1900, y: 1100 },
    { id: "shard-05", x: 2500, y: 900 },
  ],
};
