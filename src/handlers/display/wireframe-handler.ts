// Core
import * as THREE from 'three';
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

  /** Список wireframe-объектов для текущих мешей */
  private _wireframes: THREE.LineSegments[] = [];

  /** Ссылка на API рендерера */
  private readonly _api: RendererApi;

  constructor(@inject('RendererApi') api: RendererApi) {
    this._api = api;
  }

  /**
   * Применяет wireframe-режим к сцене.
   */
  public handle(): void {
    const meshes = this._api.getMeshes();

    // Если уже в wireframe — ничего не делаем
    if (this._wireframes.length > 0) return;

    // Создаем wireframe для каждого меша
    this._wireframes = meshes.map((mesh) => {
      // Создаём геометрию рёбер поверх исходной
      const geo = new THREE.WireframeGeometry(mesh.geometry);

      // Материал для отображения wireframe
      const mat = new THREE.LineBasicMaterial({
        color: 0x00ffff, // бирюзовый, как в Blender
        linewidth: 1,
      });

      // Создаём LineSegments для отображения рёбер
      const line = new THREE.LineSegments(geo, mat);

      // Совмещаем позицию, вращение и масштаб с исходным мешем
      line.position.copy(mesh.position);
      line.rotation.copy(mesh.rotation);
      line.scale.copy(mesh.scale);

      // Добавляем линию как дочерний элемент меша
      // — чтобы рёбра двигались и вращались вместе с ним
      mesh.add(line);

      return line;
    });

    // Просто скрываем оригинальную геометрию, но меши оставляем в сцене
    // (так как линии теперь внутри мешей)
    meshes.forEach((mesh) => {
      const material = mesh.material as THREE.Material;
      material.visible = false;
    });
  }

  /**
   * Отключает wireframe-режим и возвращает оригинальные меши.
   */
  public rollback(): void {
    const meshes = this._api.getMeshes();

    // Убираем линии из мешей
    for (const mesh of meshes) {
      const wire = this._wireframes.find((wf) => wf.parent === mesh);
      if (wire) {
        mesh.remove(wire);
        wire.geometry.dispose();
        (wire.material as THREE.Material).dispose();
      }

      // Возвращаем видимость мешей
      const material = mesh.material as THREE.Material;
      material.visible = true;
    }

    this._wireframes = [];
  }

  /**
   * Очистка ресурсов.
   */
  public destroy(): void {
    for (const wf of this._wireframes) {
      wf.geometry.dispose();
      (wf.material as THREE.Material).dispose();
    }
    this._wireframes = [];
  }
}
