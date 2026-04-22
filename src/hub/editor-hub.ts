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
import { FeatureType } from '../types/feature/feature-type';
import type { IResponse } from '../interfaces/response';
// Interfaces
import type { IController } from '../interfaces/controller/controller';
import type { ITransformStore } from '../interfaces/store/transform-store';
import type { IMediator } from '../interfaces/mediator';

/**
 * Хаб для управления редактированием
 * @public
 */
@injectable()
export class EditorHub implements Disposable {
  public constructor(
    @inject('Renderer') private _renderer: Renderer,
    @inject('IMediator') private _mediator: IMediator,
    @inject('EditorStore') private _store: ITransformStore,
    @inject('IController') private _controller: IController,
  ) {
    this.setSelectMode(SelectMode.Mesh);
    this.setToolMode(ToolType.Translate);
  }

  public setDisplayMode(mode: DisplayMode): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Display,
      payload: [mode],
    });
  }

  public setSceneMode(mode: SceneMode): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [mode],
    });
  }

  public setSelectMode(mode: SelectMode): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Select,
      payload: [mode],
    });
  }

  public setToolMode(mode: ToolType): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Tool,
      payload: [mode],
    });
  }

  public addFigure(mode: SceneMode, figure: FigureType): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [mode, figure],
    });
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
    this._mediator.dispose();
  }
}
