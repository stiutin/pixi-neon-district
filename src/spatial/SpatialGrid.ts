import type {AABB} from '../math/AABB';
import {swapRemove} from '../utils/array';
import type {SpatialObject} from './SpatialObject';

function toCellKey(cellX: number, cellY: number): number {
  return ((cellX & 0xffff) << 16) | (cellY & 0xffff);
}

export class SpatialGrid<T extends SpatialObject> {
  private readonly cells = new Map<number, T[]>();
  private readonly cellsByObject = new Map<T, number[]>();
  private readonly visited = new Set<T>();

  constructor(private readonly cellSize: number) {
    if (cellSize <= 0) throw new RangeError('cellSize must be positive');
  }

  public get size(): number {
    return this.cellsByObject.size;
  }

  public insert(object: T): void {
    if (this.cellsByObject.has(object)) this.remove(object);

    const keys: number[] = [];
    this.forEachCellKey(object.getSpatialBounds(), (key) => {
      let cell = this.cells.get(key);
      if (!cell) {
        cell = [];
        this.cells.set(key, cell);
      }
      cell.push(object);
      keys.push(key);
    });

    this.cellsByObject.set(object, keys);
  }

  public remove(object: T): void {
    const keys = this.cellsByObject.get(object);
    if (!keys) return;

    for (const key of keys) {
      const cell = this.cells.get(key);
      if (!cell) continue;

      swapRemove(cell, cell.indexOf(object));

      if (cell.length === 0) this.cells.delete(key);
    }

    this.cellsByObject.delete(object);
  }

  public update(object: T): void {
    this.insert(object);
  }

  public clear(): void {
    this.cells.clear();
    this.cellsByObject.clear();
  }

  public query(bounds: AABB, out: T[] = []): T[] {
    out.length = 0;
    this.visited.clear();

    this.forEachCellKey(bounds, (key) => {
      const cell = this.cells.get(key);
      if (!cell) return;

      for (const object of cell) {
        if (this.visited.has(object)) continue;
        this.visited.add(object);
        out.push(object);
      }
    });

    return out;
  }

  private forEachCellKey(bounds: AABB, callback: (key: number) => void): void {
    const minCellX = Math.floor(bounds.x / this.cellSize);
    const maxCellX = Math.floor((bounds.x + bounds.width) / this.cellSize);
    const minCellY = Math.floor(bounds.y / this.cellSize);
    const maxCellY = Math.floor((bounds.y + bounds.height) / this.cellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        callback(toCellKey(cellX, cellY));
      }
    }
  }
}
