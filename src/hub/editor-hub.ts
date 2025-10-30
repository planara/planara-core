// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
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
export class EditorHub implements Disposable {
  public constructor(
    @inject('IDisplayManager') private _displayManager: IDisplayManager,
    @inject('ISelectManager') private _selectManager: ISelectManager,
    @inject('IToolManager') private _toolManager: IToolManager,
    @inject('EditorRenderer') private _renderer: EditorRenderer,
  ) {
    this.setSelectMode(SelectMode.Mesh);
    this.setToolMode(ToolType.Translate);
  }

  public setDisplayMode(mode: DisplayMode) {
    this._displayManager.manage(mode);
  }

  public setSelectMode(mode: SelectMode) {
    this._selectManager.manage(mode);
  }

  public setToolMode(mode: ToolType) {
    this._toolManager.manage(mode);
  }

  public resizeRenderer() {
    this._renderer.resize();
  }

  public updateRenderer() {
    this._renderer.loop();
  }

  public addFigure(figure: Figure) {
    this._renderer.addFigure(figure);
  }

  public dispose(): Promise<void> | void {
    this._displayManager.dispose();
    this._selectManager.dispose();
    this._renderer.dispose();
  }
}
