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

/** IOC-контейнер редактора */
let editorContainer: DependencyContainer | null = null;

/** IOC-контейнер вьювера */
let viewerContainer: DependencyContainer | null = null;

/** IOC-контейнер бенчмарка */
let benchmarkContainer: DependencyContainer | null = null;

/**
 * Инициализирует редактор и возвращает хаб.
 *
 * @remarks
 * Каждый вызов создает новый независимый контейнер редактора.
 *
 * @public
 */
export const createEditorHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): EditorHub => {
  const container = createEditorContainer(canvas, rendererConfig);

  editorContainer = container;

  return container.resolve<EditorHub>('EditorHub');
};

/**
 * Возвращает последний созданный хаб редактора.
 *
 * @public
 */
export const getEditorHub = (): EditorHub => {
  if (!editorContainer) {
    throw new Error('EditorHub is not initialized. Call createEditorHub(canvas) first.');
  }

  return editorContainer.resolve<EditorHub>('EditorHub');
};

/**
 * Сбрасывает текущий контейнер редактора.
 *
 * @public
 */
export const clearEditorHub = (): void => {
  editorContainer = null;
};

/**
 * Инициализирует вьювер и возвращает хаб.
 *
 * @remarks
 * Каждый вызов создает новый независимый контейнер вьювера.
 *
 * @public
 */
export const createViewerHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): ViewerHub => {
  const container = createViewerContainer(canvas, rendererConfig);

  viewerContainer = container;

  return container.resolve<ViewerHub>('ViewerHub');
};

/**
 * Возвращает последний созданный хаб вьювера.
 *
 * @public
 */
export const getViewerHub = (): ViewerHub => {
  if (!viewerContainer) {
    throw new Error('ViewerHub is not initialized. Call createViewerHub(canvas) first.');
  }

  return viewerContainer.resolve<ViewerHub>('ViewerHub');
};

/**
 * Сбрасывает текущий контейнер вьювера.
 *
 * @public
 */
export const clearViewerHub = (): void => {
  viewerContainer = null;
};

/**
 * Инициализирует бенчмарк и возвращает хаб.
 *
 * @remarks
 * Каждый вызов создает новый независимый контейнер бенчмарка.
 *
 * @public
 */
export const createBenchmarkHub = (
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): BenchmarkHub => {
  const container = createBenchmarkContainer(canvas, rendererConfig);

  benchmarkContainer = container;

  return container.resolve<BenchmarkHub>('BenchmarkHub');
};

/**
 * Возвращает последний созданный хаб бенчмарка.
 *
 * @public
 */
export const getBenchmarkHub = (): BenchmarkHub => {
  if (!benchmarkContainer) {
    throw new Error('BenchmarkHub is not initialized. Call createBenchmarkHub(canvas) first.');
  }

  return benchmarkContainer.resolve<BenchmarkHub>('BenchmarkHub');
};

/**
 * Сбрасывает текущий контейнер бенчмарка.
 *
 * @public
 */
export const clearBenchmarkHub = (): void => {
  benchmarkContainer = null;
};
