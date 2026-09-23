import { describe, expect, it } from "vitest";
import { swapRemove } from "./array";

describe("swapRemove", () => {
  it("replaces the removed item with the last one", () => {
    const items = ["a", "b", "c", "d"];
    swapRemove(items, 1);
    expect(items).toEqual(["a", "d", "c"]);
  });

  it("removes the last item", () => {
    const items = [1, 2, 3];
    swapRemove(items, 2);
    expect(items).toEqual([1, 2]);
  });

  it("ignores out-of-range indices", () => {
    const items = [1, 2];
    swapRemove(items, -1);
    swapRemove(items, 5);
    expect(items).toEqual([1, 2]);
  });
});
