// Types
import type { RendererInfoMetrics } from '@/types/renderer';

/**
 * API доступа к метрикам WebGL-рендерера.
 *
 * @remarks
 * Предоставляет только статистику рендеринга без доступа к самому renderer.
 * Используется модулями диагностики и сбора метрик.
 *
 * @public
 * @interface
 */
export interface IRendererInfoAccess {
  /**
   * Возвращает текущую статистику рендерера.
   *
   * @returns Метрики WebGL-рендера за текущий кадр
   */
  getRendererInfo(): RendererInfoMetrics;
}
