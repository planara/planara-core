// IOC
import 'reflect-metadata';
import { container as globalContainer, type DependencyContainer } from 'tsyringe';
// Core
import { Renderer } from '../core/renderer';
// Managers
import { DisplayManager } from '../managers/display-manager';
// Handlers
import { WireframeHandler } from '../handlers/display/wireframe-handler';
// Interfaces
import type { IDisplayManager } from '../interfaces/manager';
import type { IDisplayHandler } from '../interfaces/display-handler';
// Types
import { RendererApi } from '../utils/renderer-api';
// Hub
import { EditorHub } from '../hub/editor-hub';

export function createContainer(renderer: Renderer): DependencyContainer {
  const container = globalContainer.createChildContainer();

  // ============== CORE ===================
  container.registerInstance('EditorRenderer', renderer);
  container.registerSingleton('RendererApi', RendererApi);

  // ============== HANDLERS ===============
  container.registerSingleton<IDisplayHandler>('IDisplayHandler', WireframeHandler);

  // ============== MANAGERS ===============
  container.registerSingleton<IDisplayManager>('IDisplayManager', DisplayManager);

  // ============== HUB ====================
  container.registerSingleton('EditorHub', EditorHub);

  return container;
}
