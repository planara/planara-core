// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { DisplayMode } from '@planara/types';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager';

/**
 * Хаб для управления редактированием
 * @public
 */
@injectable()
export class EditorHub {
  constructor(@inject('IDisplayManager') private displayManager: IDisplayManager) {}

  setDisplayMode(mode: DisplayMode) {
    this.displayManager.manage(mode);
  }

  destroy() {
    this.displayManager.destroy();
  }
}
