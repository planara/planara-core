// IOC
import 'reflect-metadata';
import { createEditorContainer, createViewerContainer } from '@/ioc/container';
import type { DependencyContainer } from 'tsyringe';
// Hub
import type { EditorHub } from '@/hub/editor-hub';
import type { ViewerHub } from '@/hub/viewer-hub';
// Types
import type { RendererConfigInput } from '@planara/types';

/** IOC-контейнер */
let _container: DependencyContainer | null = null;

/**
 * Инициализирует редактор и возвращает хаб.
 * Вызывать один раз при старте (когда есть canvas).
 * @public
 */
export const createEditorHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): EditorHub => {
  if (_container) {
    return _container.resolve<EditorHub>('EditorHub');
  }

  _container = createEditorContainer(canvas, rendererConfig);
  return _container.resolve<EditorHub>('EditorHub');
};

/**
 * Возвращает уже созданный хаб, если редактор инициализирован.
 * @public
 */
export const getEditorHub = (): EditorHub => {
  if (!_container) {
    throw new Error('EditorHub is not initialized. Call createEditorHub(canvas) first.');
  }

  return _container.resolve<EditorHub>('EditorHub');
};

/**
 * Инициализирует вьювер и возвращает хаб.
 * Вызывать один раз при старте (когда есть canvas).
 * @public
 */
export const createViewerHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): ViewerHub => {
  if (_container) {
    return _container.resolve<ViewerHub>('ViewerHub');
  }

  _container = createViewerContainer(canvas, rendererConfig);
  return _container.resolve<ViewerHub>('ViewerHub');
};

/**
 * Возвращает уже созданный хаб, если редактор инициализирован.
 * @public
 */
export const getViewerHub = (): ViewerHub => {
  if (!_container) {
    throw new Error('ViewerHub is not initialized. Call createViewerHub(canvas) first.');
  }

  return _container.resolve<ViewerHub>('ViewerHub');
};
