// Core
import type { Renderer } from '@/core';
// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
// Types
import { type FigureType, SceneMode, type IResponse } from '@planara/types';
import { FeatureType } from '@/types/feature';
// Interfaces
import type { IWorker } from '@/interfaces/worker';
import type { IMediator } from '@/interfaces/mediator';
// Hub
import { clearViewerHub } from '@/hub/index';
// Utils
import { disposeAll } from '@/shared/utils';

/**
 * Хаб для управления вьювером
 * @public
 */
@injectable()
export class ViewerHub implements Disposable {
  /**
   * Promise освобождения ресурсов этого экземпляра.
   * Сохраняется с первого вызова `dispose()`, чтобы все вызывающие
   * могли дождаться завершения одной операции.
   */
  private _disposal: Promise<void> | null = null;

  public constructor(
    @inject('Renderer') private _renderer: Renderer,
    @inject('IMediator') private _mediator: IMediator,
    @inject('IWorker') private _worker: IWorker,
  ) {}

  public addFigure(figure: FigureType): IResponse | null {
    return this._mediator.send({
      type: FeatureType.Scene,
      payload: [SceneMode.AddFigure, figure],
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
   * Останавливает вьювер.
   */
  public stop(): void {
    this._worker.stop();
  }

  /**
   * Останавливает рендер и освобождает ресурсы вьювера.
   *
   * @remarks
   * Обработчики сцены и модули завершают работу, пока renderer и canvas
   * ещё доступны. Renderer освобождается последним.
   *
   * @returns Promise завершения очистки. Повторный вызов возвращает тот же Promise.
   */
  public dispose(): Promise<void> {
    if (this._disposal) return this._disposal;

    this._worker.stop();
    clearViewerHub(this);

    this._disposal = Promise.resolve().then(() =>
      disposeAll([this._mediator, this._worker, this._renderer]),
    );

    return this._disposal;
  }
}
