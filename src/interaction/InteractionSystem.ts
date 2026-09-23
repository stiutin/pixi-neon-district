import { aabbFromCenter } from "../math/AABB";
import { type Point, distanceSquared } from "../math/Point";
import type { SpatialGrid } from "../spatial/SpatialGrid";
import type { Interactable } from "./Interactable";

export class InteractionSystem {
  private readonly radiusSquared: number;
  private readonly candidates: Interactable[] = [];

  constructor(
    private readonly grid: SpatialGrid<Interactable>,
    private readonly radius: number,
  ) {
    this.radiusSquared = radius * radius;
  }

  public findNearest(position: Point): Interactable | null {
    const searchBounds = aabbFromCenter(position.x, position.y, this.radius);

    let nearest: Interactable | null = null;
    let nearestDistanceSquared = this.radiusSquared;

    for (const candidate of this.grid.query(searchBounds, this.candidates)) {
      if (!candidate.canInteract()) continue;

      const candidateDistanceSquared = distanceSquared(position, candidate.getPosition());

      if (candidateDistanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = candidateDistanceSquared;
        nearest = candidate;
      }
    }

    return nearest;
  }
}
