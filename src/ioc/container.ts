// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { EditorRenderer } from '../core/editor-renderer';
// Managers
import { DisplayManager } from '../managers/display/display-manager';
import { SelectManager } from '../managers/select/select-manager';
import { ToolManager } from '../managers/tool/tool-manager';
// Handlers
import { WireframeHandler } from '../handlers/display/wireframe-handler';
import { MeshSelectHandler } from '../handlers/select/mesh-select-handler';
import { TranslateToolHandler } from '../handlers/tool/translate-tool-handler';
import { ScaleToolHandler } from '../handlers/tool/scale-tool-handler';
import { RotateToolHandler } from '../handlers/tool/rotate-tool-handler';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager/display-manager';
import type { IDisplayHandler } from '../interfaces/handler/display-handler';
import type { ISelectManager } from '../interfaces/manager/select-manager';
import type { ISelectHandler } from '../interfaces/handler/select-handler';
import type { IToolManager } from '../interfaces/manager/tool-manager';
import type { IToolHandler } from '../interfaces/handler/tool-handler';
// Types
import { RendererApi } from '../utils/renderer-api';
// Hub
import { EditorHub } from '../hub/editor-hub';
// Event bus
import { EventBus } from '../events/event-bus';

let isContainerInitialized = false;
const container = globalContainer.createChildContainer();

export function createContainer(canvas: HTMLCanvasElement): DependencyContainer {
  if (isContainerInitialized) return container;

  // HTML
  container.registerInstance('Canvas', canvas);

  // Event bus
  container.registerSingleton('EventBus', EventBus);

  // Core
  container.registerSingleton<EditorRenderer>('EditorRenderer', EditorRenderer);
  container.registerSingleton<RendererApi>('RendererApi', RendererApi);

  // Handlers
  container.registerSingleton<IDisplayHandler>('IDisplayHandler', WireframeHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', MeshSelectHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', TranslateToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', ScaleToolHandler);
  container.registerSingleton<IToolHandler>('IToolHandler', RotateToolHandler);

  // Managers
  container.registerSingleton<IDisplayManager>('IDisplayManager', DisplayManager);
  container.registerSingleton<ISelectManager>('ISelectManager', SelectManager);
  container.registerSingleton<IToolManager>('IToolManager', ToolManager);

  // Hub
  container.registerSingleton('EditorHub', EditorHub);

  isContainerInitialized = true;

  return container;
}

export { container };
