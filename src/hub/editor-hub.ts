// Core
import type { Renderer } from '../core/renderer';
// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
// Types
import {
  type DisplayMode,
  type FigureTransform,
  type FigureType,
  SceneMode,
  SelectMode,
  ToolType,
} from '@planara/types';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager/display-manager';
import type { ISelectManager } from '../interfaces/manager/select-manager';
import type { IToolManager } from '../interfaces/manager/tool-manager';
import type { ISceneManager } from '../interfaces/manager/scene-manager';
import type { IEditorStore } from '../interfaces/store/editor-store';
import type { IController } from '../interfaces/controller/controller';

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
    @inject('ISceneManager') private _sceneManager: ISceneManager,
    @inject('Renderer') private _renderer: Renderer,
    @inject('IEditorStore') private _store: IEditorStore,
    @inject('IController') private _controller: IController,
  ) {
    this.setSelectMode(SelectMode.Mesh);
    this.setToolMode(ToolType.Translate);
  }

  public setDisplayMode(mode: DisplayMode) {
    this._displayManager.manage(mode);
  }

  public setSceneMode(sceneMode: SceneMode) {
    this._sceneManager.manage(sceneMode);
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

  /**
   * Запускает редактор.
   * Вызывается после создания хаба.
   */
  public start(): void {
    this._controller.start();
  }

  /**
   * Останавливает редактор.
   */
  public stop(): void {
    this._controller.stop();
  }

  public addFigure(mode: SceneMode, figure: FigureType) {
    this._sceneManager.manage(mode, figure);
  }

  public getSelectionStats(): FigureTransform | null {
    return this._store.getSelectionStats();
  }

  public onSelectionStatsChange(listener: () => void): () => void {
    const offSelected = this._store.onSelectedObjectChange(() => {
      listener();
    });

    const offTransform = this._store.onSelectedTransformChange(() => {
      listener();
    });

    return () => {
      offSelected();
      offTransform();
    };
  }

  public dispose(): Promise<void> | void {
    this._displayManager.dispose();
    this._selectManager.dispose();
  }
}
