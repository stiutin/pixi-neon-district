import type { AABB } from "../math/AABB";
import type { SpatialObject } from "../spatial/SpatialObject";

export interface Collider extends SpatialObject {
  getCollisionBounds(): AABB;
}
