import type { AABB } from "../math/AABB";

export interface SpatialObject {
  getSpatialBounds(): AABB;
}
