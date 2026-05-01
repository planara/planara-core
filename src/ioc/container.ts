// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { Renderer } from '@/core';
import { RendererController } from '@/controllers';
// API
import { MeshApi, RaycastApi, TransformApi, ControlsStateApi } from '@/api/modules';
import { CameraApi, DomApi, SceneApi } from '@/api/renderer';
// Modules
import {
  ControlsModule,
  GizmoModule,
  RaycastModule,
  SceneModule,
  ScenePreviewModule,
} from '@/modules';
// Managers
import { DisplayManager, SelectManager, ToolManager, SceneManager } from '@/managers';
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
// Interfaces
import type {
  IDisplayHandler,
  ISelectHandler,
  IToolHandler,
  ISceneHandler,
} from '@/interfaces/handler';
import type {
  IMeshApi,
  IRaycastApi,
  ITransformApi,
  ICameraApi,
  IDomApi,
  ISceneApi,
  IControlsStateApi,
} from '@/interfaces/api';
import type { IController } from '@/interfaces/controller';
import type { IMiddleware } from '@/interfaces/middleware';
import type { IMediator } from '@/interfaces/mediator';
// Hub
import { EditorHub } from '@/hub/editor-hub';
// Event bus
import { EventBus } from '@/events';
// Store
import { EditorStore, ExportStore } from '@/store';
// Policies
import { ToolPolicy } from '@/policy';
// Validator
import { ObjValidator } from '@/validators';
// Middlewares
import { ExceptionMiddleware } from '@/middlewares';
// Mediator
import { Mediator } from '@/mediator';
// Types
import type { RendererConfigInput } from '@planara/types';
// Utils
import { mergeRendererConfig, defaultRendererConfig } from '@/utils';
import { ViewerHub } from '@/hub/viewer-hub';

let isContainerInitialized = false;
const container = globalContainer.createChildContainer();

export function createEditorContainer(
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  if (isContainerInitialized) return container;

  // HTML
  container.registerInstance('Canvas', canvas);

  // Config
  container.registerInstance(
    'RendererConfig',
    mergeRendererConfig(defaultRendererConfig, rendererConfig),
  );

  // Event bus
  container.registerSingleton('EventBus', EventBus);

  // Core
  container.registerSingleton<IController>('IController', RendererController);

  container.registerSingleton('Renderer', Renderer);

  container.register('IRenderable', { useToken: 'Renderer' });
  container.register('IRendererAccess', { useToken: 'Renderer' });
  container.register('IRendererCameraAccess', { useToken: 'Renderer' });
  container.register('IRendererDomAccess', { useToken: 'Renderer' });
  container.register('IRendererSceneAccess', { useToken: 'Renderer' });

  // Policies
  container.registerSingleton('ToolPolicy', ToolPolicy);

  // Validators
  container.registerSingleton('ObjValidator', ObjValidator);

  // API
  container.registerSingleton<IMeshApi>('IMeshApi', MeshApi);
  container.registerSingleton<IControlsStateApi>('IControlsStateApi', ControlsStateApi);
  container.registerSingleton<IRaycastApi>('IRaycastApi', RaycastApi);
  container.registerSingleton<ITransformApi>('ITransformApi', TransformApi);
  container.registerSingleton<ICameraApi>('ICameraApi', CameraApi);
  container.registerSingleton<IDomApi>('IDomApi', DomApi);
  container.registerSingleton<ISceneApi>('ISceneApi', SceneApi);

  // Modules
  container.registerSingleton('ControlsModule', ControlsModule);
  container.registerSingleton('GizmoModule', GizmoModule);
  container.registerSingleton('RaycastModule', RaycastModule);
  container.registerSingleton('SceneModule', SceneModule);

  container.register('IUpdatableModule', { useToken: 'ControlsModule' });
  container.register('IRenderableModule', { useToken: 'GizmoModule' });
  container.register('IRuntimeModule', { useToken: 'RaycastModule' });
  container.register('IRuntimeModule', { useToken: 'SceneModule' });

  // Handlers
  container.registerSingleton<IDisplayHandler>('IDisplayHandler', WireframeHandler);

  container.registerSingleton<ISelectHandler>('ISelectHandler', MeshSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', FaceSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', EdgeSelectHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', VertexSelectHandler);

  container.registerSingleton<IToolHandler>('IToolHandler', TranslateToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', ScaleToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', RotateToolHandler);

  container.registerSingleton<ISceneHandler>('ISceneHandler', AddFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', DeleteFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', ExportSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadSceneHandler);

  // Managers
  container.registerSingleton('DisplayManager', DisplayManager);
  container.register('IDisplayManager', { useToken: 'DisplayManager' });
  container.register('IManager', { useToken: 'DisplayManager' });

  container.registerSingleton('SelectManager', SelectManager);
  container.register('ISelectManager', { useToken: 'SelectManager' });
  container.register('IManager', { useToken: 'SelectManager' });

  container.registerSingleton('ToolManager', ToolManager);
  container.register('IToolManager', { useToken: 'ToolManager' });
  container.register('IManager', { useToken: 'ToolManager' });

  container.registerSingleton('SceneManager', SceneManager);
  container.register('ISceneManager', { useToken: 'SceneManager' });
  container.register('IManager', { useToken: 'SceneManager' });

  // Middlewares
  container.registerSingleton<IMiddleware>('IMiddleware', ExceptionMiddleware);

  // Mediator
  container.registerSingleton<IMediator>('IMediator', Mediator);

  // Hub
  container.registerSingleton('EditorHub', EditorHub);

  // Store
  container.registerSingleton('EditorStore', EditorStore);
  container.registerSingleton('ExportStore', ExportStore);

  isContainerInitialized = true;

  return container;
}

export function createViewerContainer(
  canvas: HTMLCanvasElement,
  rendererConfig?: RendererConfigInput,
): DependencyContainer {
  if (isContainerInitialized) return container;

  // HTML
  container.registerInstance('Canvas', canvas);

  // Config
  container.registerInstance(
    'RendererConfig',
    mergeRendererConfig(defaultRendererConfig, rendererConfig),
  );

  // Core
  container.registerSingleton<IController>('IController', RendererController);

  container.registerSingleton('Renderer', Renderer);

  container.register('IRenderable', { useToken: 'Renderer' });
  container.register('IRendererAccess', { useToken: 'Renderer' });
  container.register('IRendererCameraAccess', { useToken: 'Renderer' });
  container.register('IRendererDomAccess', { useToken: 'Renderer' });
  container.register('IRendererSceneAccess', { useToken: 'Renderer' });

  // Validators
  container.registerSingleton('ObjValidator', ObjValidator);

  // API
  container.registerSingleton<IMeshApi>('IMeshApi', MeshApi);
  container.registerSingleton<ICameraApi>('ICameraApi', CameraApi);
  container.registerSingleton<IDomApi>('IDomApi', DomApi);
  container.registerSingleton<ISceneApi>('ISceneApi', SceneApi);

  // Modules
  container.registerSingleton('ControlsModule', ControlsModule);
  container.registerSingleton('SceneModule', ScenePreviewModule);

  container.register('IUpdatableModule', { useToken: 'ControlsModule' });
  container.register('IRuntimeModule', { useToken: 'SceneModule' });

  // Handlers
  container.registerSingleton<ISceneHandler>('ISceneHandler', AddFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', ExportSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadFigureSceneHandler);
  container.registerSingleton<ISceneHandler>('ISceneHandler', LoadSceneHandler);

  // Managers
  container.registerSingleton('SceneManager', SceneManager);
  container.register('ISceneManager', { useToken: 'SceneManager' });
  container.register('IManager', { useToken: 'SceneManager' });

  // Middlewares
  container.registerSingleton<IMiddleware>('IMiddleware', ExceptionMiddleware);

  // Mediator
  container.registerSingleton<IMediator>('IMediator', Mediator);

  // Hub
  container.registerSingleton('ViewerHub', ViewerHub);

  // Store
  container.registerSingleton('ExportStore', ExportStore);

  isContainerInitialized = true;

  return container;
}

export { container };
