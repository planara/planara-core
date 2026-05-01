// Core
import type { Renderer } from '@/core';
// IOC
import { type Disposable, inject, injectable } from 'tsyringe';
// Types
import { type FigureType, SceneMode, type IResponse } from '@planara/types';
import { FeatureType } from '@/types/feature';
// Interfaces
import type { IController } from '@/interfaces/controller';
import type { IMediator } from '@/interfaces/mediator';

/**
 * Хаб для управления вьювером
 * @public
 */
@injectable()
export class ViewerHub implements Disposable {
  public constructor(
    @inject('Renderer') private _renderer: Renderer,
    @inject('IMediator') private _mediator: IMediator,
    @inject('IController') private _controller: IController,
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
   * Запускает вьювер.
   * Вызывается после создания хаба.
   */
  public start(): void {
    this._controller.start();
  }

  /**
   * Останавливает вьювер.
   */
  public stop(): void {
    this._controller.stop();
  }

  public dispose(): Promise<void> | void {
    this._mediator.dispose();
  }
}
