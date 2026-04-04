// Core
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IDomApi } from '../../interfaces/api/dom-api';
import type { IRendererDomAccess } from '../../interfaces/api/renderer/renderer-dom-access';

/**
 * Реализация API для доступа к DOM-элементам рендерера.
 *
 * @remarks
 * Предоставляет доступ к canvas и DOM-элементу рендерера.
 * Используется модулями, которым нужно взаимодействовать с DOM
 * (например, для подписки на события мыши).
 *
 * @see {@link IDomApi} - интерфейс, который реализует этот класс
 * @see {@link IRendererDomAccess} - низкоуровневый доступ к DOM
 * @see {@link Renderer} - рендерер, предоставляющий доступ
 *
 * @internal
 * @class
 */
@injectable()
export class DomApi implements IDomApi {
  public constructor(@inject('IRendererDomAccess') private _domAccessApi: IRendererDomAccess) {}

  public getCanvas(): HTMLCanvasElement {
    return this._domAccessApi.getCanvas();
  }

  public getDomElement(): HTMLElement {
    return this._domAccessApi.getDomElement();
  }
}
