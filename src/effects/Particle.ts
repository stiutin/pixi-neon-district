import {Graphics, GraphicsContext} from 'pixi.js';

const BASE_RADIUS = 4;
const MIN_RADIUS = 2;
const LIFETIME = {min: 0.4, max: 0.75} as const;
const MAX_INITIAL_SPEED = 220;
const DRAG = 0.9;
const COLORS = [0x4de3ff, 0xff4dd8] as const;

const sharedContext = new GraphicsContext().circle(0, 0, BASE_RADIUS).fill(0xffffff);

const random = (min: number, max: number): number => min + Math.random() * (max - min);

export class Particle extends Graphics {
  private velocityX = 0;
  private velocityY = 0;
  private lifetime = 1;
  private remaining = 0;

  constructor() {
    super(sharedContext);
  }

  public get isAlive(): boolean {
    return this.remaining > 0;
  }

  public spawn(x: number, y: number): void {
    const radius = random(MIN_RADIUS, BASE_RADIUS);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.sqrt(Math.random()) * MAX_INITIAL_SPEED;

    this.position.set(x, y);
    this.scale.set(radius / BASE_RADIUS);
    this.tint = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];
    this.alpha = 1;
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
    this.lifetime = random(LIFETIME.min, LIFETIME.max);
    this.remaining = this.lifetime;
  }

  public update(deltaTime: number): void {
    const drag = Math.exp(-DRAG * deltaTime);

    this.velocityX *= drag;
    this.velocityY *= drag;
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    this.remaining -= deltaTime;
    this.alpha = Math.max(0, this.remaining / this.lifetime);
  }
}
