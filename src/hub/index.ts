// IOC
import 'reflect-metadata';
import {
  createEditorContainer,
  createViewerContainer,
  createBenchmarkContainer,
} from '@/shared/ioc/container';
import type { DependencyContainer } from 'tsyringe';
// Hub
import type { EditorHub } from '@/hub/editor-hub';
import type { ViewerHub } from '@/hub/viewer-hub';
import type { BenchmarkHub } from '@/hub/benchmark-hub';
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
 * Возвращает уже созданный хаб, если вьювер инициализирован.
 * @public
 */
export const getViewerHub = (): ViewerHub => {
  if (!_container) {
    throw new Error('ViewerHub is not initialized. Call createViewerHub(canvas) first.');
  }

  return _container.resolve<ViewerHub>('ViewerHub');
};

/**
 * Инициализирует бенчмарк и возвращает хаб.
 * Вызывать один раз при старте (когда есть canvas).
 * @public
 */
export const createBenchmarkHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): BenchmarkHub => {
  if (_container) {
    return _container.resolve<BenchmarkHub>('BenchmarkHub');
  }

  _container = createBenchmarkContainer(canvas, rendererConfig);
  return _container.resolve<BenchmarkHub>('BenchmarkHub');
};

/**
 * Возвращает уже созданный хаб, если бенчмарк инициализирован.
 * @public
 */
export const getBenchmarkHub = (): BenchmarkHub => {
  if (!_container) {
    throw new Error('ViewerHub is not initialized. Call createBenchmarkHub(canvas) first.');
  }

  return _container.resolve<BenchmarkHub>('BenchmarkHub');
};
