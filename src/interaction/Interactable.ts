import type {Point} from '../math/Point';
import type {SpatialObject} from '../spatial/SpatialObject';

export type InteractionResult =
  | {
      readonly kind: 'collected';
      readonly id: string;
      readonly position: Point;
    }
  | {
      readonly kind: 'dialogue';
      readonly speaker: string;
      readonly text: string;
    };

export interface Interactable extends SpatialObject {
  canInteract(): boolean;
  interact(): InteractionResult;
  getInteractionLabel(): string;
  getPosition(): Point;
}
