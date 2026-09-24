import type {Container} from 'pixi.js';

import type {Updatable} from './GameLoop';
import type {Scene} from './Scene';

export class SceneManager implements Updatable {
  private currentScene: Scene | null = null;

  constructor(private readonly stage: Container) {}

  public changeScene(nextScene: Scene): void {
    const previousScene = this.currentScene;

    this.currentScene = nextScene;
    this.stage.addChild(nextScene);

    if (previousScene) {
      this.stage.removeChild(previousScene);
      previousScene.dispose();
    }
  }

  public update(deltaTime: number): void {
    this.currentScene?.update(deltaTime);
  }

  public destroy(): void {
    this.currentScene?.dispose();
    this.currentScene = null;
  }
}
