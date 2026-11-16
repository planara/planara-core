// Core
import type { Renderer } from '@/core';
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
  type IResponse,
  type ExportSceneResult,
} from '@planara/types';
import { FeatureType } from '@/types/feature';
// Interfaces
import type { IWorker } from '@/interfaces/worker';
import type { IExportStore, ITransformStore } from '@/interfaces/store';
import type { IMediator } from '@/interfaces/mediator';
// Hub
import { clearEditorHub } from '@/hub/index';
// Utils
import { disposeAll } from '@/shared/utils';

/**
 * Хаб для управления редактированием
 * @public
 */
@injectable()
export class EditorHub implements Disposable {
  /**
   * Promise освобождения ресурсов этого экземпляра.
   * Сохраняется с первого вызова `dispose()`, чтобы все вызывающие
   * могли дождаться завершения одной операции.
   */
  private _disposal: Promise<void> | null = null;

  public constructor(
    @inject('Renderer') private _renderer: Renderer,
    @inject('IMediator') private _mediator: IMediator,
    @inject('EditorStore') private _store: ITransformStore,
    @inject('ExportStore') private _exportStore: IExportStore,
    @inject('IWorker') private _worker: IWorker,
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

  public addFigure(figure: FigureType): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.AddFigure, figure],
    });
  }

  public deleteFigure(): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.DeleteFigure],
    });
  }

  public loadFigure(content: string): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.LoadFigure, content],
    });
  }

  public loadScene(content: string): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.Load, content],
    });
  }

  public exportScene(): ExportSceneResult {
    this._exportStore.clearResult();

    const response = this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.Export],
    });

    return {
      response,
      result: this._exportStore.getResult(),
    };
  }

  public resizeRenderer() {
    this._renderer.resize();
  }

  /**
   * Запускает цикл рендера или возобновляет его после `stop()`.
   *
   * @throws {@link Error}, если уже началось освобождение ресурсов хаба
   */
  public start(): void {
    if (this._disposal) throw new Error('Hub has been disposed');

    this._worker.start();
  }

  /**
   * Останавливает редактор.
   */
  public stop(): void {
    this._worker.stop();
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

  /**
   * Останавливает рендер и освобождает ресурсы редактора.
   *
   * @remarks
   * Кадры останавливаются до возврата из метода. Затем освобождаются менеджеры
   * и хендлеры, модули и в последнюю очередь renderer. Благодаря этому хендлеры
   * могут снять оверлеи со сцены, а модули — удалить обработчики с canvas.
   *
   * @returns Promise завершения очистки. Повторный вызов возвращает тот же Promise.
   */
  public dispose(): Promise<void> {
    if (this._disposal) return this._disposal;

    this._worker.stop();
    clearEditorHub(this);

    this._disposal = Promise.resolve().then(() =>
      disposeAll([this._mediator, this._worker, this._renderer]),
    );

    return this._disposal;
  }
}
