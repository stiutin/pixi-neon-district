import { describe, expect, it } from "vitest";
import { aabbFromCenter, intersects } from "./AABB";

describe("intersects", () => {
  const box = { x: 0, y: 0, width: 10, height: 10 };

  it("detects overlap", () => {
    expect(intersects(box, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });

  it("treats touching edges as not intersecting", () => {
    expect(intersects(box, { x: 10, y: 0, width: 10, height: 10 })).toBe(false);
    expect(intersects(box, { x: 0, y: 10, width: 10, height: 10 })).toBe(false);
  });

  it("detects containment", () => {
    expect(intersects(box, { x: 2, y: 2, width: 2, height: 2 })).toBe(true);
  });

  it("returns false for separated boxes", () => {
    expect(intersects(box, { x: 50, y: 50, width: 5, height: 5 })).toBe(false);
  });
});

describe("aabbFromCenter", () => {
  it("builds a square by default", () => {
    expect(aabbFromCenter(100, 50, 10)).toEqual({ x: 90, y: 40, width: 20, height: 20 });
  });

  it("supports separate half extents", () => {
    expect(aabbFromCenter(0, 0, 4, 2)).toEqual({ x: -4, y: -2, width: 8, height: 4 });
  });
});
