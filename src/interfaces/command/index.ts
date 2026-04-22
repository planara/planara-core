// Types
import type { FeatureType } from '../../types/feature/feature-type';

/**
 * @public
 */
export interface ICommand {
  type: FeatureType;
  payload: unknown[];
}
