// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { RendererInfoMetrics } from '@/types/renderer';
// Interfaces
import type { IRendererInfoAccess } from '@/interfaces/api/renderer';
import type { IRendererInfoApi } from '@/interfaces/api';

/**
 * API доступа к статистике WebGL-рендерера.
 *
 * @internal
 * @class
 */
@injectable()
export class RendererInfoApi implements IRendererInfoApi {
  /**
   * Конструктор API статистики рендерера.
   *
   * @param _rendererInfoAccess - внутренний доступ к информации о рендерере
   */
  public constructor(
    @inject('IRendererInfoAccess') private readonly _rendererInfoAccess: IRendererInfoAccess,
  ) {}

  /**
   * Возвращает текущую статистику рендерера.
   *
   * @returns Метрики WebGL-рендера за текущий кадр
   */
  public getRendererInfo(): RendererInfoMetrics {
    return this._rendererInfoAccess.getRendererInfo();
  }
}
