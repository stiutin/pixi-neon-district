import type {AssetManager} from '../assets/AssetManager';
import {AudioSystem} from '../audio/AudioSystem';
import {CollisionSystem} from '../collision/CollisionSystem';
import {GAME_CONFIG} from '../config/game.config';
import {Scene} from '../core/Scene';
import {ParticlePool} from '../effects/ParticlePool';
import {Player} from '../entities/Player';
import {InputManager} from '../input/InputManager';
import type {InteractionResult} from '../interaction/Interactable';
import {InteractionSystem} from '../interaction/InteractionSystem';
import {clamp} from '../math/clamp';
import {SaveGame} from '../save/SaveGame';
import {HUD} from '../ui/HUD';
import {InteractionPrompt} from '../ui/InteractionPrompt';
import {MessageBanner} from '../ui/MessageBanner';
import {Overlay} from '../ui/Overlay';
import {TouchControls} from '../ui/TouchControls';
import {Camera} from '../world/Camera';
import {World} from '../world/World';

type GameState = 'playing' | 'paused' | 'completed';

const PAUSE_HELP = [
  'WASD / arrows - move   ·   E - interact',
  'M - sound   ·   F - fullscreen',
  'R - reset progress   ·   Esc / P - resume',
].join('\n');

export class MainScene extends Scene {
  private readonly save = new SaveGame(GAME_CONFIG.saveKey);
  private readonly audio: AudioSystem;
  private readonly input = new InputManager();
  private readonly world: World;
  private readonly player: Player;
  private readonly camera: Camera;
  private readonly particles: ParticlePool;
  private readonly collision: CollisionSystem;
  private readonly interaction: InteractionSystem;
  private readonly hud = new HUD();
  private readonly prompt = new InteractionPrompt();
  private readonly banner = new MessageBanner();
  private readonly overlay = new Overlay();
  private readonly touch = new TouchControls(this.input);
  private readonly unsubscribers: (() => void)[] = [];
  private state: GameState = 'playing';
  private fpsFrames = 0;
  private fpsTime = 0;

  constructor(assets: AssetManager) {
    super();

    const saveData = this.save.load();

    this.audio = new AudioSystem(saveData.soundEnabled);
    this.world = new World(assets);
    this.world.restoreCollected(new Set(saveData.collectedIds));
    this.player = new Player(assets.getTexture('player'));
    this.world.entityLayer.addChild(this.player);
    this.camera = new Camera(this.world, GAME_CONFIG, GAME_CONFIG.world, GAME_CONFIG.camera.smoothing);
    this.particles = new ParticlePool(this.world.effectsLayer);
    this.collision = new CollisionSystem(this.world.collisionGrid);
    this.interaction = new InteractionSystem(this.world.interactionGrid, GAME_CONFIG.interaction.radius);
    this.hud.position.set(16, 16);
    this.prompt.position.set(16, 102);

    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    this.touch.setEnabled(isTouch);
    this.hud.setShowKeyHints(!isTouch);

    this.addChild(this.world, this.hud, this.prompt, this.banner, this.overlay, this.touch);

    this.respawnPlayer();
    this.refreshHud();

    this.unsubscribers.push(
      this.input.onPress('toggleFullscreen', () => {
        void toggleFullscreen();
      })
    );
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.world.isComplete()) {
      this.setState('completed');
    } else {
      this.banner.show('Recover the missing data shards. Talk to locals for hints.', 'Neon District');
    }
  }

  public update(deltaTime: number): void {
    this.updateFps(deltaTime);
    this.handleGlobalActions();

    if (this.state === 'playing') {
      this.movePlayer(deltaTime);
      this.updateInteraction();
      this.world.update(deltaTime);
      this.particles.update(deltaTime);
      this.camera.update(this.player, deltaTime);
    }

    this.banner.update(deltaTime);
    this.input.endFrame();
  }

  public override dispose(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.input.destroy();
    this.audio.destroy();
    this.particles.destroy();
    super.dispose();
  }

  private setState(next: GameState): void {
    this.state = next;
    this.prompt.hide();

    switch (next) {
      case 'playing':
        this.overlay.hide();
        break;
      case 'paused':
        this.overlay.show('PAUSED', PAUSE_HELP);
        break;
      case 'completed':
        this.overlay.show('DISTRICT COMPLETE', 'All data shards recovered.\nEsc - keep exploring   ·   R - start over');
        break;
    }
  }

  private handleGlobalActions(): void {
    if (this.input.wasPressed('pause')) {
      this.setState(this.state === 'playing' ? 'paused' : 'playing');
    }

    if (this.input.wasPressed('toggleSound')) {
      this.audio.setEnabled(!this.audio.isEnabled());
      this.audio.playConfirm();
      this.refreshHud();
      this.persist();
    }

    if (this.input.wasPressed('reset') && this.state !== 'playing') {
      this.resetProgress();
    }
  }

  private movePlayer(deltaTime: number): void {
    let dirX = this.input.axis('moveLeft', 'moveRight');
    let dirY = this.input.axis('moveUp', 'moveDown');

    if (dirX === 0 && dirY === 0) return;

    const length = Math.hypot(dirX, dirY);

    dirX /= length;
    dirY /= length;

    const distance = this.player.speed * deltaTime;

    this.tryMove(dirX * distance, 0);
    this.tryMove(0, dirY * distance);

    const margin = this.player.hitboxHalfSize;

    this.player.x = clamp(this.player.x, margin, GAME_CONFIG.world.width - margin);

    this.player.y = clamp(this.player.y, margin, GAME_CONFIG.world.height - margin);

    this.player.syncDepth();
  }

  private tryMove(dx: number, dy: number): void {
    if (dx === 0 && dy === 0) return;

    this.player.x += dx;
    this.player.y += dy;

    if (this.collision.isColliding(this.player.getCollisionBounds())) {
      this.player.x -= dx;
      this.player.y -= dy;
    }
  }

  private updateInteraction(): void {
    const target = this.interaction.findNearest(this.player);

    if (!target) {
      this.prompt.hide();
      return;
    }

    this.prompt.show(target.getInteractionLabel());

    if (this.input.wasPressed('interact')) {
      this.handleInteraction(target.interact());
    }
  }

  private handleInteraction(result: InteractionResult): void {
    switch (result.kind) {
      case 'collected': {
        this.particles.burst(result.position.x, result.position.y, 18);
        this.refreshHud();
        this.persist();

        if (this.world.isComplete()) {
          this.audio.playComplete();
          this.setState('completed');
        } else {
          this.audio.playCollect();
          const left = this.world.getTotalCollectibles() - this.world.getCollectedCount();
          this.banner.show(`Shard recovered. ${left} left.`);
        }

        break;
      }
      case 'dialogue':
        this.audio.playTalk();
        this.banner.show(result.text, result.speaker);
        break;
    }
  }

  private resetProgress(): void {
    this.world.restoreCollected(new Set());
    this.persist();
    this.respawnPlayer();
    this.refreshHud();
    this.setState('playing');
    this.banner.show('Progress reset. The shards are back out there.');
  }

  private respawnPlayer(): void {
    this.player.position.copyFrom(GAME_CONFIG.player.spawn);
    this.player.syncDepth();
    this.camera.snapTo(this.player);
  }

  private refreshHud(): void {
    this.hud.setScore(this.world.getCollectedCount(), this.world.getTotalCollectibles());
    this.hud.setSoundEnabled(this.audio.isEnabled());
  }

  private persist(): void {
    this.save.save({
      collectedIds: this.world.getCollectedIds(),
      soundEnabled: this.audio.isEnabled(),
    });
  }

  private updateFps(deltaTime: number): void {
    this.fpsFrames++;
    this.fpsTime += deltaTime;

    if (this.fpsTime < GAME_CONFIG.ui.fpsSampleInterval) return;

    this.hud.setFPS(this.fpsFrames / this.fpsTime);
    this.fpsFrames = 0;
    this.fpsTime = 0;
  }

  private readonly handleVisibilityChange = (): void => {
    if (document.hidden && this.state === 'playing') this.setState('paused');
  };
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen is unsupported (e.g. iOS Safari) or was denied - not critical.
  }
}
