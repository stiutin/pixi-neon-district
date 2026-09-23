import { Assets, type Texture } from "pixi.js";
import { ASSET_MANIFEST, GAME_BUNDLE, type TextureAlias } from "./asset-manifest";

export type ProgressHandler = (progress: number) => void;

export class AssetManager {
  private static initialized: Promise<void> | null = null;

  public async loadGame(onProgress?: ProgressHandler): Promise<void> {
    AssetManager.initialized ??= Assets.init({ manifest: ASSET_MANIFEST });
    await AssetManager.initialized;
    await Assets.loadBundle(GAME_BUNDLE, onProgress);
  }

  public getTexture(alias: TextureAlias): Texture {
    const texture = Assets.get<Texture | undefined>(alias);
    if (!texture) throw new Error(`Texture "${alias}" is not loaded`);
    return texture;
  }
}
