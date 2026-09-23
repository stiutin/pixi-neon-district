import { describe, expect, it } from "vitest";
import type { AABB } from "../math/AABB";
import { SpatialGrid } from "./SpatialGrid";

class Box {
  constructor(
    public readonly name: string,
    public bounds: AABB,
  ) {}
  public getSpatialBounds(): AABB {
    return this.bounds;
  }
}

const box = (name: string, x: number, y: number, size = 10): Box =>
  new Box(name, { x, y, width: size, height: size });

const names = (items: Box[]): string[] => items.map((item) => item.name).sort();

describe("SpatialGrid", () => {
  it("returns only objects from overlapping cells", () => {
    const grid = new SpatialGrid<Box>(100);
    grid.insert(box("near", 10, 10));
    grid.insert(box("far", 950, 950));

    expect(names(grid.query({ x: 0, y: 0, width: 50, height: 50 }))).toEqual(["near"]);
  });

  it("returns an object spanning several cells only once", () => {
    const grid = new SpatialGrid<Box>(100);
    grid.insert(box("big", 50, 50, 300));

    expect(grid.query({ x: 0, y: 0, width: 400, height: 400 })).toHaveLength(1);
  });

  it("handles negative coordinates", () => {
    const grid = new SpatialGrid<Box>(64);
    grid.insert(box("negative", -200, -150));

    expect(names(grid.query({ x: -210, y: -160, width: 20, height: 20 }))).toEqual(["negative"]);
    expect(grid.query({ x: 200, y: 150, width: 20, height: 20 })).toHaveLength(0);
  });

  it("removes objects from every cell they occupied", () => {
    const grid = new SpatialGrid<Box>(100);
    const big = box("big", 0, 0, 250);
    grid.insert(big);
    grid.remove(big);

    expect(grid.size).toBe(0);
    expect(grid.query({ x: 0, y: 0, width: 300, height: 300 })).toHaveLength(0);
  });

  it("re-indexes a moved object on update", () => {
    const grid = new SpatialGrid<Box>(100);
    const mover = box("mover", 10, 10);
    grid.insert(mover);

    mover.bounds = { x: 510, y: 510, width: 10, height: 10 };
    grid.update(mover);

    expect(grid.query({ x: 0, y: 0, width: 50, height: 50 })).toHaveLength(0);
    expect(names(grid.query({ x: 500, y: 500, width: 50, height: 50 }))).toEqual(["mover"]);
    expect(grid.size).toBe(1);
  });

  it("reuses the output array when provided", () => {
    const grid = new SpatialGrid<Box>(100);
    grid.insert(box("a", 0, 0));
    const out: Box[] = [box("stale", 0, 0)];

    const result = grid.query({ x: 0, y: 0, width: 10, height: 10 }, out);

    expect(result).toBe(out);
    expect(names(result)).toEqual(["a"]);
  });

  it("rejects a non-positive cell size", () => {
    expect(() => new SpatialGrid<Box>(0)).toThrow(RangeError);
  });
});
