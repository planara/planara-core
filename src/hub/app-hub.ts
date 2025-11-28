// IOC
import 'reflect-metadata';
import { createContainer } from '../ioc/container';
// Hub
import type { EditorHub } from './editor-hub';
import type { DependencyContainer } from 'tsyringe';

/** IOC-контейнер */
let _container: DependencyContainer | null = null;

/**
 * Инициализирует редактор и возвращает хаб.
 * Вызывать один раз при старте (когда есть canvas).
 * @public
 */
export const createAppHub = (canvas: HTMLCanvasElement): EditorHub => {
  if (_container) {
    return _container.resolve<EditorHub>('EditorHub');
  }

  _container = createContainer(canvas);
  return _container.resolve<EditorHub>('EditorHub');
};

/**
 * Возвращает уже созданный хаб, если редактор инициализирован.
 */
export const getAppHub = (): EditorHub => {
  if (!_container) {
    throw new Error('EditorHub is not initialized. Call createAppHub(canvas) first.');
  }

  return _container.resolve<EditorHub>('EditorHub');
};
