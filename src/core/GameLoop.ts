import type {Ticker} from 'pixi.js';

export interface Updatable {
  update(deltaTime: number): void;
}

export class GameLoop {
  private running = false;

  constructor(
    private readonly ticker: Ticker,
    private readonly target: Updatable,
    private readonly maxDeltaTime: number
  ) {}

  public start(): void {
    if (this.running) return;

    this.running = true;
    this.ticker.add(this.tick);
  }

  public stop(): void {
    if (!this.running) return;

    this.running = false;
    this.ticker.remove(this.tick);
  }

  private readonly tick = (ticker: Ticker): void => {
    const deltaTime = Math.min(ticker.elapsedMS / 1000, this.maxDeltaTime);

    this.target.update(deltaTime);
  };
}
