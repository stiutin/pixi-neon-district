import type { Application } from "pixi.js";
import { AssetManager } from "../assets/AssetManager";
import { GAME_CONFIG } from "../config/game.config";
import { GameLoop } from "../core/GameLoop";
import { SceneManager } from "../core/SceneManager";
import { LoadingScene } from "../scenes/LoadingScene";
import { MainScene } from "../scenes/MainScene";
import { Viewport } from "./Viewport";

export class Game {
  private readonly assets = new AssetManager();
  private readonly viewport: Viewport;
  private readonly scenes: SceneManager;
  private readonly loop: GameLoop;

  constructor(private readonly app: Application) {
    this.viewport = new Viewport(app, {
      designWidth: GAME_CONFIG.width,
      designHeight: GAME_CONFIG.height,
      maxResolution: GAME_CONFIG.maxResolution,
    });
    this.scenes = new SceneManager(app.stage);
    this.loop = new GameLoop(app.ticker, this.scenes, GAME_CONFIG.maxDeltaTime);
  }

  public start(): void {
    this.scenes.changeScene(new LoadingScene(this.assets, this.startMainScene));
    this.loop.start();
  }

  public destroy(): void {
    this.loop.stop();
    this.scenes.destroy();
    this.viewport.destroy();
    this.app.destroy(true);
  }

  private readonly startMainScene = (): void => {
    this.scenes.changeScene(new MainScene(this.assets));
  };
}
