// Types
import type { RendererInfoMetrics } from '@/types/renderer';

/**
 * API доступа к метрикам WebGL-рендерера.
 *
 * @remarks
 * Предоставляет только статистику рендеринга без доступа к самому renderer.
 * Используется модулями диагностики и сбора метрик.
 *
 * @internal
 */
export interface IRendererInfoApi {
  /**
   * Возвращает текущую статистику рендерера.
   *
   * @returns Метрики WebGL-рендера за текущий кадр
   */
  getRendererInfo(): RendererInfoMetrics;
}
