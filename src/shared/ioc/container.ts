// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { Renderer } from '@/core';
import { RendererWorker } from '@/workers';
// API
import {
  MeshApi,
  RaycastApi,
  TransformApi,
  ControlsStateApi,
  InteractionApi,
} from '@/shared/api/modules';
import { CameraApi, DomApi, RendererInfoApi, SceneApi } from '@/shared/api/renderer';
// Modules
import {
  ControlsModule,
  GizmoModule,
  RaycastModule,
  SceneModule,
  ScenePreviewModule,
  MetricsModule,
} from '@/modules';
// Managers
import {
  DisplayManager,
  SelectManager,
  ToolManager,
  SceneManager,
  BenchmarkManager,
} from '@/managers';
// Handlers
import { WireframeHandler } from '@/handlers/display';
import {
  MeshSelectHandler,
  FaceSelectHandler,
  VertexSelectHandler,
  EdgeSelectHandler,
} from '@/handlers/select';
import { TranslateToolHandler, ScaleToolHandler, RotateToolHandler } from '@/handlers/tool';
import {
  AddFigureSceneHandler,
  DeleteFigureSceneHandler,
  ExportSceneHandler,
  LoadFigureSceneHandler,
  LoadSceneHandler,
} from '@/handlers/scene';
import {
  HeavyBenchmarkHandler,
  LightBenchmarkHandler,
  MediumBenchmarkHandler,
  MixedBenchmarkHandler,
} from '@/handlers/benchmark';
// Interfaces
import type {
  IDisplayHandler,
  ISelectHandler,
  IToolHandler,
  ISceneHandler,
  IBenchmarkHandler,
} from '@/interfaces/handler';
import type {
  IMeshApi,
  IRaycastApi,
  ITransformApi,
  ICameraApi,
  IDomApi,
  ISceneApi,
  IControlsStateApi,
  IRendererInfoApi,
  IInteractionApi,
} from '@/interfaces/api';
import type { IWorker } from '@/interfaces/worker';
import type { IMiddleware } from '@/interfaces/middleware';
import type { IMediator } from '@/interfaces/mediator';
// Hubs
import { EditorHub } from '@/hub/editor-hub';
import { ViewerHub } from '@/hub/viewer-hub';
import { BenchmarkHub } from '@/hub/benchmark-hub';
// Event bus
import { EventBus } from '@/shared/events';
// Store
import { EditorStore, ExportStore, MetricsStore } from '@/store';
// Policies
import { ToolPolicy } from '@/shared/policy';
// Validator
import { ObjValidator } from '@/shared/validators';
// Middlewares
import { ExceptionMiddleware } from '@/middlewares';
// Mediator
import { Mediator } from '@/mediator';
// Types
import type { RendererConfigInput } from '@planara/types';
// Utils
import { mergeRendererConfig, defaultRendererConfig } from '@/shared/utils';

function createBaseContainer(): DependencyContainer {
  return globalContainer.createChildContainer();
}

function registerCanvas(container: DependencyContainer, canvas: HTMLCanvasElement): void {
  container.registerInstance('Canvas', canvas);
}

function registerRendererConfig(
  container: DependencyContainer,
  rendererConfig?: RendererConfigInput,
): void {
  container.registerInstance(
    'RendererConfig',
    mergeRendererConfig(defaultRendererConfig, rendererConfig),
  );
}

function registerCore(container: DependencyContainer): void {
  container.registerSingleton<IWorker>('IWorker', RendererWorker);

  container.registerSingleton('Renderer', Renderer);

  container.register('IRenderable', { useToken: 'Renderer' });
  container.register('IRendererAccess', { useToken: 'Renderer' });
  container.register('IRendererCameraAccess', { useToken: 'Renderer' });
  container.register('IRendererDomAccess', { useToken: 'Renderer' });
  container.register('IRendererSceneAccess', { useToken: 'Renderer' });
}

function registerBenchmarkCore(container: DependencyContainer): void {
  container.register('IRendererInfoAccess', { useToken: 'Renderer' });
}

function registerEventBus(container: DependencyContainer): void {
  container.registerSingleton('EventBus', EventBus);
}

function registerPolicies(container: DependencyContainer): void {
  container.registerSingleton('ToolPolicy', ToolPolicy);
}

function registerValidators(container: DependencyContainer): void {
  container.registerSingleton('ObjValidator', ObjValidator);
}

function registerCommonRendererApi(container: DependencyContainer): void {
  container.registerSingleton<IMeshApi>('IMeshApi', MeshApi);
  container.registerSingleton<ICameraApi>('ICameraApi', CameraApi);
  container.registerSingleton<IDomApi>('IDomApi', DomApi);
  container.registerSingleton<ISceneApi>('ISceneApi', SceneApi);
}

function registerEditorApi(container: DependencyContainer): void {
  registerCommonRendererApi(container);

  container.registerSingleton<IControlsStateApi>('IControlsStateApi', ControlsStateApi);
  container.registerSingleton<IRaycastApi>('IRaycastApi', RaycastApi);
  container.registerSingleton<ITransformApi>('ITransformApi', TransformApi);
  container.registerSingleton<IInteractionApi>('IInteractionApi', InteractionApi);
}

function registerViewerApi(container: DependencyContainer): void {
  registerCommonRendererApi(container);
}

function registerBenchmarkApi(container: DependencyContainer): void {
  container.registerSingleton<IRendererInfoApi>('IRendererInfoApi', RendererInfoApi);
}

function registerEditorModules(container: DependencyContainer): void {
  container.registerSingleton('ControlsModule', ControlsModule);
  container.registerSingleton('GizmoModule', GizmoModule);
  container.registerSingleton('RaycastModule', RaycastModule);
  container.registerSingleton('SceneModule', SceneModule);

  container.register('IUpdatableModule', { useToken: 'ControlsModule' });
  container.register('IRenderableModule', { useToken: 'GizmoModule' });
  container.register('IRuntimeModule', { useToken: 'RaycastModule' });
  container.register('IRuntimeModule', { useToken: 'SceneModule' });

  container.register('IInteractiveModule', { useToken: 'ControlsModule' });
  container.register('IInteractiveModule', { useToken: 'RaycastModule' });
  container.register('IInteractiveModule', { useToken: 'GizmoModule' });
}

function registerViewerModules(container: DependencyContainer): void {
  container.registerSingleton('ControlsModule', ControlsModule);
  container.registerSingleton('SceneModule', ScenePreviewModule);

  container.register('IUpdatableModule', { useToken: 'ControlsModule' });
  container.register('IRuntimeModule', { useToken: 'SceneModule' });

  container.register('IInteractiveModule', { useToken: 'ControlsModule' });
}

function registerBenchmarkModules(container: DependencyContainer): void {
  container.registerSingleton('MetricsModule', MetricsModule);

  container.register('IObserverModule', { useToken: 'MetricsModule' });
  container.register('IMetricsApi', { useToken: 'MetricsModule' });
}

function registerDisplayHandlers(container: DependencyContainer): void {
  container.registerSingleton<IDisplayHandler>('IDisplayHandler', WireframeHandler);
}

function registerSelectHandlers(container: DependencyContainer): void {
  container.registerSingleton<ISelectHandler>('ISelectHandler', MeshSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', FaceSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', EdgeSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', VertexSelectHandler);
}

function registerToolHandlers(container: DependencyContainer): void {
  container.registerSingleton<IToolHandler>('IToolHandler', TranslateToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', ScaleToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', RotateToolHandler);
}

function registerEditorSceneHandlers(container: DependencyContainer): void {
  container.registerSingleton<ISceneHandler>('ISceneHandler', AddFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', DeleteFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', ExportSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadSceneHandler);
}

function registerViewerSceneHandlers(container: DependencyContainer): void {
  container.registerSingleton<ISceneHandler>('ISceneHandler', AddFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', ExportSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadSceneHandler);
}

function registerBenchmarkHandlers(container: DependencyContainer): void {
  container.registerSingleton<IBenchmarkHandler>('IBenchmarkHandler', LightBenchmarkHandler);
  container.registerSingleton<IBenchmarkHandler>('IBenchmarkHandler', MediumBenchmarkHandler);
  container.registerSingleton<IBenchmarkHandler>('IBenchmarkHandler', HeavyBenchmarkHandler);
  container.registerSingleton<IBenchmarkHandler>('IBenchmarkHandler', MixedBenchmarkHandler);
}

function registerDisplayManager(container: DependencyContainer): void {
  container.registerSingleton('DisplayManager', DisplayManager);
  container.register('IDisplayManager', { useToken: 'DisplayManager' });
  container.register('IManager', { useToken: 'DisplayManager' });
}

function registerSelectManager(container: DependencyContainer): void {
  container.registerSingleton('SelectManager', SelectManager);
  container.register('ISelectManager', { useToken: 'SelectManager' });
  container.register('IManager', { useToken: 'SelectManager' });
}

function registerToolManager(container: DependencyContainer): void {
  container.registerSingleton('ToolManager', ToolManager);
  container.register('IToolManager', { useToken: 'ToolManager' });
  container.register('IManager', { useToken: 'ToolManager' });
}

function registerSceneManager(container: DependencyContainer): void {
  container.registerSingleton('SceneManager', SceneManager);
  container.register('ISceneManager', { useToken: 'SceneManager' });
  container.register('IManager', { useToken: 'SceneManager' });
}

function registerBenchmarkManager(container: DependencyContainer): void {
  container.registerSingleton('BenchmarkManager', BenchmarkManager);
  container.register('IBenchmarkManager', { useToken: 'BenchmarkManager' });
  container.register('IManager', { useToken: 'BenchmarkManager' });
}

function registerEditorManagers(container: DependencyContainer): void {
  registerDisplayManager(container);
  registerSelectManager(container);
  registerToolManager(container);
  registerSceneManager(container);
}

function registerViewerManagers(container: DependencyContainer): void {
  registerSceneManager(container);
}

function registerPipeline(container: DependencyContainer): void {
  container.registerSingleton<IMiddleware>('IMiddleware', ExceptionMiddleware);
  container.registerSingleton<IMediator>('IMediator', Mediator);
}

function registerEditorStores(container: DependencyContainer): void {
  container.registerSingleton('EditorStore', EditorStore);
  container.registerSingleton('ExportStore', ExportStore);
}

function registerViewerStores(container: DependencyContainer): void {
  container.registerSingleton('ExportStore', ExportStore);
}

function registerBenchmarkStores(container: DependencyContainer): void {
  container.registerSingleton('MetricsStore', MetricsStore);
}

function registerEditorHub(container: DependencyContainer): void {
  container.registerSingleton('EditorHub', EditorHub);
}

function registerViewerHub(container: DependencyContainer): void {
  container.registerSingleton('ViewerHub', ViewerHub);
}

function registerBenchmarkHub(container: DependencyContainer): void {
  container.registerSingleton('BenchmarkHub', BenchmarkHub);
}

function registerEditorContainer(
  container: DependencyContainer,
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  registerCanvas(container, canvas);
  registerRendererConfig(container, rendererConfig);

  registerEventBus(container);
  registerCore(container);
  registerPolicies(container);
  registerValidators(container);

  registerEditorApi(container);
  registerEditorModules(container);

  registerDisplayHandlers(container);
  registerSelectHandlers(container);
  registerToolHandlers(container);
  registerEditorSceneHandlers(container);

  registerEditorManagers(container);
  registerPipeline(container);
  registerEditorHub(container);
  registerEditorStores(container);

  return container;
}

function registerBenchmarkContainer(
  container: DependencyContainer,
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  registerEditorContainer(container, canvas, rendererConfig);
  registerBenchmarkCore(container);
  registerBenchmarkModules(container);
  registerBenchmarkApi(container);
  registerBenchmarkHandlers(container);
  registerBenchmarkManager(container);
  registerBenchmarkStores(container);
  registerBenchmarkHub(container);

  return container;
}

function registerViewerContainer(
  container: DependencyContainer,
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  registerCanvas(container, canvas);
  registerRendererConfig(container, rendererConfig);

  registerCore(container);
  registerValidators(container);

  registerViewerApi(container);
  registerViewerModules(container);

  registerViewerSceneHandlers(container);

  registerViewerManagers(container);
  registerPipeline(container);
  registerViewerHub(container);
  registerViewerStores(container);

  return container;
}

export function createEditorContainer(
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  return registerEditorContainer(createBaseContainer(), canvas, rendererConfig);
}

export function createViewerContainer(
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  return registerViewerContainer(createBaseContainer(), canvas, rendererConfig);
}

export function createBenchmarkContainer(
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  return registerBenchmarkContainer(createBaseContainer(), canvas, rendererConfig);
}
