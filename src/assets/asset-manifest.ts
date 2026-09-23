import type { AssetsManifest } from "pixi.js";

const url = (file: string): string => `${import.meta.env.BASE_URL}assets/${file}`;

export const TEXTURE_ALIASES = ["player", "tree", "building", "npc", "collectible"] as const;
export type TextureAlias = (typeof TEXTURE_ALIASES)[number];

export const GAME_BUNDLE = "game";

export const ASSET_MANIFEST: AssetsManifest = {
  bundles: [
    {
      name: GAME_BUNDLE,
      assets: TEXTURE_ALIASES.map((alias) => ({
        alias,
        src: url(`${alias}.png`),
      })),
    },
  ],
};
