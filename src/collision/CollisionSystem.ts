import {type AABB, intersects} from '../math/AABB';
import type {SpatialGrid} from '../spatial/SpatialGrid';
import type {Collider} from './Collider';

export class CollisionSystem {
  private readonly candidates: Collider[] = [];

  constructor(private readonly grid: SpatialGrid<Collider>) {}

  public isColliding(bounds: AABB): boolean {
    for (const collider of this.grid.query(bounds, this.candidates)) {
      if (intersects(bounds, collider.getCollisionBounds())) return true;
    }
    return false;
  }
}
