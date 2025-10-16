// Core
import * as THREE from 'three';

/**
 * Интерфейс для управления фигурами внутри рендерера.
 * Предоставляет базовый CRUD-набор операций для добавления, удаления и получения фигур из сцены.
 * @internal
 */
export interface IMeshApi {
  /**
   * Добавляет фигуру в сцену.
   *
   * @param mesh - Фигура, которую необходимо добавить.
   */
  addMesh(mesh: THREE.Mesh): void;

  /**
   * Добавляет несколько фигур в сцену за один вызов.
   *
   * @param meshes - Массив фигур для добавления.
   */
  addMeshes(meshes: THREE.Mesh[]): void;

  /**
   * Удаляет фигуру из сцены.
   *
   * @param mesh - Фигура, которую необходимо удалить.
   */
  removeMesh(mesh: THREE.Mesh): void;

  /**
   * Удаляет несколько фигур из сцены за один вызов.
   *
   * @param meshes - Массив фигур для удаления.
   */
  removeMeshes(meshes: THREE.Mesh[]): void;

  /**
   * Возвращает список всех фигур, находящихся в сцене.
   *
   * @returns Массив текущих фигур.
   */
  getMeshes(): THREE.Mesh[];
}
