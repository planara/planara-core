// IOC
import { inject, injectable } from 'tsyringe';
// Types
import { type DisplayMode, type Figure, SelectMode, ToolType } from '@planara/types';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager/display-manager';
import type { ISelectManager } from '../interfaces/manager/select-manager';
import type { EditorRenderer } from '../core/editor-renderer';
import type { IToolManager } from '../interfaces/manager/tool-manager';

/**
 * Хаб для управления редактированием
 * @public
 */
@injectable()
export class EditorHub {
  constructor(
    @inject('IDisplayManager') private _displayManager: IDisplayManager,
    @inject('ISelectManager') private _selectManager: ISelectManager,
    @inject('IToolManager') private _toolManager: IToolManager,
    @inject('EditorRenderer') private _renderer: EditorRenderer,
  ) {
    this.setSelectMode(SelectMode.Mesh);
    this.setToolMode(ToolType.Translate);
  }

  setDisplayMode(mode: DisplayMode) {
    this._displayManager.manage(mode);
  }

  setSelectMode(mode: SelectMode) {
    this._selectManager.manage(mode);
  }

  setToolMode(mode: ToolType) {
    this._toolManager.manage(mode);
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
