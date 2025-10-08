// Core
import { type Mesh, NormalProgram, type OGLRenderingContext, WireMesh } from 'ogl';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IDisplayHandler } from '../../interfaces/display-handler';
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
  private wireMeshes!: WireMesh[];

  /** Настройки рендеринга для режима wireframe */
  private readonly wireMeshProgram!: NormalProgram;

  /** WebGl контекст */
  private readonly context!: OGLRenderingContext;

  constructor(@inject('RendererApi') private api: RendererApi) {
    // Инициализация массива wireframe-фигур для объектов на сцене
    this.wireMeshes = [];

    // Получение WebGl контекста
    this.context = this.api.getContext();

    // Настройки рендеринга для wireframe режима
    this.wireMeshProgram = new NormalProgram(this.context);
  }

  /**
   * Применяет wireframe-режим к сцене.
   */
  public handle() {
    const meshes = this.api.getMeshes();

    // Создание wireframe моделей для фигур на сцене
    this.createWireMeshes(meshes);

    // Сокрытие фигур для режима wireframe
    this.api.removeMeshes(meshes);

    // Добавление wireframe моделей на сцену
    this.api.addMeshes(this.wireMeshes);
  }

  /**
   * Отменяет wireframe-режим у сцены.
   */
  rollback(): void {
    const meshes = this.api.getMeshes();

    // Сокрытие фигур для режима wireframe
    this.api.removeMeshes(this.wireMeshes);

    // Добавление wireframe моделей на сцену
    this.api.addMeshes(meshes);
  }

  /**
   * Освобождает ресурсы хендлера, удаляет wireframe-модели со сцены.
   */
  destroy(): void {
    if (this.wireMeshes) {
      this.wireMeshes.length = 0;
      this.wireMeshes = [];
    }
  }

  /**
   * Создание wireframe-моделей для фигур на сцене.
   */
  private createWireMeshes(meshes: Mesh[]) {
    for (const mesh of meshes) {
      // Создание wireframe-модели для добавленного объекта
      const wireMesh = new WireMesh(this.context, {
        geometry: mesh.geometry,
        program: this.wireMeshProgram,
      });

      this.wireMeshes.push(wireMesh);
    }
  }
}
