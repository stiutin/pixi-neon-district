import {describe, expect, it} from 'vitest';

import {aabbFromCenter} from '../math/AABB';
import {SpatialGrid} from '../spatial/SpatialGrid';
import type {Interactable, InteractionResult} from './Interactable';
import {InteractionSystem} from './InteractionSystem';

function fakeInteractable(x: number, y: number, available = true): Interactable {
  return {
    canInteract: () => available,
    interact: (): InteractionResult => ({
      kind: 'dialogue',
      speaker: '',
      text: '',
    }),
    getInteractionLabel: () => '',
    getPosition: () => ({x, y}),
    getSpatialBounds: () => aabbFromCenter(x, y, 8),
  };
}

function setup(...items: Interactable[]): InteractionSystem {
  const grid = new SpatialGrid<Interactable>(64);
  items.forEach((item) => {
    grid.insert(item);
  });
  return new InteractionSystem(grid, 50);
}

describe('InteractionSystem', () => {
  it('picks the nearest interactable within the radius', () => {
    const near = fakeInteractable(20, 0);
    const nearer = fakeInteractable(10, 0);
    const system = setup(near, nearer);

    expect(system.findNearest({x: 0, y: 0})).toBe(nearer);
  });

  it('ignores objects outside the circular radius (even inside the query box)', () => {
    const system = setup(fakeInteractable(40, 40));
    expect(system.findNearest({x: 0, y: 0})).toBeNull();
  });

  it("skips objects that can't be interacted with", () => {
    const unavailable = fakeInteractable(5, 0, false);
    const available = fakeInteractable(30, 0);
    const system = setup(unavailable, available);

    expect(system.findNearest({x: 0, y: 0})).toBe(available);
  });
});
