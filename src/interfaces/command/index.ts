// Types
import type { FeatureType } from '@/types/feature';

/**
 * @public
 */
export interface ICommand {
  type: FeatureType;
  payload: unknown[];
}
