// IOC
import 'reflect-metadata';
import { createContainer } from '../ioc/container';
// Hub
import type { EditorHub } from './editor-hub';
// Core
import { Renderer } from '../core/renderer';

/**
 * Создаёт или возвращает готовый экземпляр хаба.
 * @public
 */
export function createAppHub(renderer: Renderer): EditorHub {
  const container = createContainer(renderer);
  return container.resolve<EditorHub>('EditorHub');
}
