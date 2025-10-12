// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { EditorRenderer } from '../core/editor-renderer';
// Managers
import { DisplayManager } from '../managers/display/display-manager';
import { SelectManager } from '../managers/select/select-manager';
// Handlers
import { WireframeHandler } from '../handlers/display/wireframe-handler';
import { MeshSelectHandler } from '../handlers/select/mesh-select-handler';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager/display-manager';
import type { IDisplayHandler } from '../interfaces/handler/display-handler';
import type { ISelectManager } from '../interfaces/manager/select-manager';
import type { ISelectHandler } from '../interfaces/handler/select-handler';
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

  // ============== HTML ==========================
  container.registerInstance('Canvas', canvas);

  // ============== EVENT BUS ==============
  container.registerSingleton('EventBus', EventBus);

  // ============== CORE ===================
  container.registerSingleton<EditorRenderer>('EditorRenderer', EditorRenderer);
  container.registerSingleton('RendererApi', RendererApi);

  // ============== HANDLERS ===============
  container.registerSingleton<IDisplayHandler>('IDisplayHandler', WireframeHandler);
  container.registerSingleton<ISelectHandler>('ISelectHandler', MeshSelectHandler);

  // ============== MANAGERS ===============
  container.registerSingleton<IDisplayManager>('IDisplayManager', DisplayManager);
  container.registerSingleton<ISelectManager>('ISelectManager', SelectManager);

  // ============== HUB ====================
  container.registerSingleton('EditorHub', EditorHub);

  isContainerInitialized = true;

  return container;
}

export { container };
