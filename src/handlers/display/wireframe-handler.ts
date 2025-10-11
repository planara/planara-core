// Core
import { type Mesh, NormalProgram, type OGLRenderingContext, WireMesh } from 'ogl';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IDisplayHandler } from '../../interfaces/handler/display-handler';
// Utils
import type { RendererApi } from '../../utils/renderer-api';
// Types
import { DisplayMode } from '@planara/types';

/**
 * Хендлер для включения wireframe-режима.
 * Управляет сценой через RendererApi.
 * @internal
 */
@injectable()
export class WireframeHandler implements IDisplayHandler {
  /** Режим отображения */
  public readonly mode: DisplayMode = DisplayMode.Wireframe;

  /** Wireframe-модели для добавленных на сцену объектов */
  private _wireMeshes!: WireMesh[];

  /** Настройки рендеринга для режима wireframe */
  private readonly _wireMeshProgram!: NormalProgram;

  /** WebGl контекст */
  private readonly _context!: OGLRenderingContext;

  constructor(@inject('RendererApi') private _api: RendererApi) {
    // Инициализация массива wireframe-фигур для объектов на сцене
    this._wireMeshes = [];

    // Получение WebGl контекста
    this._context = this._api.getContext();

    // Настройки рендеринга для wireframe режима
    this._wireMeshProgram = new NormalProgram(this._context);
  }

  /**
   * Применяет wireframe-режим к сцене.
   */
  public handle() {
    const meshes = this._api.getMeshes();

    // Создание wireframe моделей для фигур на сцене
    this.createWireMeshes(meshes);

    // Сокрытие фигур для режима wireframe
    this._api.removeMeshes(meshes);

    // Добавление wireframe моделей на сцену
    this._api.addMeshes(this._wireMeshes);
  }

  /**
   * Отменяет wireframe-режим у сцены.
   */
  rollback(): void {
    const meshes = this._api.getMeshes();

    // Сокрытие фигур для режима wireframe
    this._api.removeMeshes(this._wireMeshes);

    // Добавление wireframe моделей на сцену
    this._api.addMeshes(meshes);
  }

  /**
   * Освобождает ресурсы хендлера, удаляет wireframe-модели со сцены.
   */
  destroy(): void {
    if (this._wireMeshes) {
      this._wireMeshes.length = 0;
      this._wireMeshes = [];
    }
  }

  /**
   * Создание wireframe-моделей для фигур на сцене.
   */
  private createWireMeshes(meshes: Mesh[]) {
    for (const mesh of meshes) {
      // Создание wireframe-модели для добавленного объекта
      const wireMesh = new WireMesh(this._context, {
        geometry: mesh.geometry,
        program: this._wireMeshProgram,
      });

      this._wireMeshes.push(wireMesh);
    }
  }
}
