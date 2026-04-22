// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { Renderer } from '../core/renderer';
import { RendererController } from '../controllers/renderer-controller';
// API
import { MeshApi } from '../api/modules/mesh-api';
import { RaycastApi } from '../api/modules/raycast-api';
import { TransformApi } from '../api/modules/transform-api';
import { CameraApi } from '../api/renderer/camera-api';
import { DomApi } from '../api/renderer/dom-api';
import { SceneApi } from '../api/renderer/scene-api';
import { ControlsStateApi } from '../api/modules/controls-state-api';
// Modules
import { ControlsModule } from '../modules/controls-module';
import { GizmoModule } from '../modules/gizmo-module';
import { RaycastModule } from '../modules/raycast-module';
import { SceneModule } from '../modules/scene-module';
// Managers
import { DisplayManager } from '../managers/display/display-manager';
import { SelectManager } from '../managers/select/select-manager';
import { ToolManager } from '../managers/tool/tool-manager';
import { SceneManager } from '../managers/scene/scene-manager';
// Handlers
import { WireframeHandler } from '../handlers/display/wireframe-handler';
import { MeshSelectHandler } from '../handlers/select/mesh-select-handler';
import { FaceSelectHandler } from '../handlers/select/face-select-handler';
import { VertexSelectHandler } from '../handlers/select/vertex-select-handler';
import { TranslateToolHandler } from '../handlers/tool/translate-tool-handler';
import { ScaleToolHandler } from '../handlers/tool/scale-tool-handler';
import { RotateToolHandler } from '../handlers/tool/rotate-tool-handler';
import { EdgeSelectHandler } from '../handlers/select/edge-select-handler';
import { AddFigureSceneHandler } from '../handlers/scene/add-figure-scene-handler';
import { DeleteFigureSceneHandler } from '../handlers/scene/delete-figure-scene-handler';
// Interfaces
import type { IDisplayHandler } from '../interfaces/handler/display-handler';
import type { ISelectHandler } from '../interfaces/handler/select-handler';
import type { IToolHandler } from '../interfaces/handler/tool-handler';
import type { ISceneHandler } from '../interfaces/handler/scene-handler';
import type { IMeshApi } from '../interfaces/api/mesh-api';
import type { IRaycastApi } from '../interfaces/api/raycast-api';
import type { ITransformApi } from '../interfaces/api/transform-api';
import type { ICameraApi } from '../interfaces/api/camera-api';
import type { IDomApi } from '../interfaces/api/dom-api';
import type { ISceneApi } from '../interfaces/api/scene-api';
import type { IControlsStateApi } from '../interfaces/api/controls-state-api';
import type { IController } from '../interfaces/controller/controller';
import type { IMiddleware } from '../interfaces/middleware';
import type { IMediator } from '../interfaces/mediator';
// Hub
import { EditorHub } from '../hub/editor-hub';
// Event bus
import { EventBus } from '../events/event-bus';
// Store
import { EditorStore } from '../store';
// Policies
import { ToolPolicy } from '../policy/tool-policy';
// Middlewares
import { ExceptionMiddleware } from '../middlewares/exception-middleware';
// Mediator
import { Mediator } from '../mediator';

let isContainerInitialized = false;
const container = globalContainer.createChildContainer();

export function createContainer(canvas: HTMLCanvasElement): DependencyContainer {
  if (isContainerInitialized) return container;

  // HTML
  container.registerInstance('Canvas', canvas);

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

  isContainerInitialized = true;

  return container;
}

export { container };
