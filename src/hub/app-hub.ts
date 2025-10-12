// IOC
import 'reflect-metadata';
import { createContainer } from '../ioc/container';
// Hub
import type { EditorHub } from './editor-hub';

/**
 * Создаёт или возвращает готовый экземпляр хаба.
 * @public
 */
export function createAppHub(canvas: HTMLCanvasElement): EditorHub {
  const container = createContainer(canvas);
  return container.resolve<EditorHub>('EditorHub');
}
