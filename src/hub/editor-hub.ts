// IOC
import { inject, injectable } from 'tsyringe';
// Types
import { type DisplayMode, type Figure, SelectMode } from '@planara/types';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager/display-manager';
import type { ISelectManager } from '../interfaces/manager/select-manager';
import type { EditorRenderer } from '../core/editor-renderer';

/**
 * Хаб для управления редактированием
 * @public
 */
@injectable()
export class EditorHub {
  constructor(
    @inject('IDisplayManager') private _displayManager: IDisplayManager,
    @inject('ISelectManager') private _selectManager: ISelectManager,
    @inject('EditorRenderer') private _renderer: EditorRenderer,
  ) {
    _selectManager.manage(SelectMode.Mesh);
  }

  setDisplayMode(mode: DisplayMode) {
    this._displayManager.manage(mode);
  }

  setSelectMode(mode: SelectMode) {
    this._selectManager.manage(mode);
  }

  resizeRenderer() {
    this._renderer.resize();
  }

  updateRenderer() {
    this._renderer.loop();
  }

  addFigure(figure: Figure) {
    this._renderer.addFigure(figure);
  }

  destroy() {
    this._displayManager.destroy();
    this._selectManager.destroy();
    this._renderer.destroy();
  }
}
