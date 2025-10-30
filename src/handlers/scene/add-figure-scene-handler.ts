// Core
import * as THREE from 'three';
// Interfaces
import type { ISceneHandler } from '../../interfaces/handler/scene-handler';
import type { IMeshApi } from '../../interfaces/api/mesh-api';
// Types
import { type FigureType, SceneMode } from '@planara/types';
// IOC
import { inject, injectable } from 'tsyringe';
// Constants
import { BASE_GEOMETRIES, BASE_MATERIAL } from '../../constants/figure-geometries';
import { EDGES_DEFAULT_COLOR } from '../../constants/colors';

/**
 * Хендлер для добавления базовых фигур на сцену.
 * Управляет сценой через RendererApi.
 * @internal
 */
@injectable()
export class AddFigureSceneHandler implements ISceneHandler {
  /** Режим редактирования сцены */
  public readonly mode: SceneMode = SceneMode.AddFigure;

  /** Последняя добавленная фигура, нужно для отката через `ctrl + z`. */
  private _lastAddedMesh: THREE.Mesh | null = null;

  public constructor(@inject('RendererApi') private _api: IMeshApi) {}

  /** Добавление базовых фигур на сцену, которые приписаны в `FigureType`. */
  public handle(figure: FigureType): void {
    // Получение геометрии базовой фигуры
    const geom = BASE_GEOMETRIES[figure]();

    // Создание динамического буфера для редактирования фигуры
    const pos = geom.getAttribute('position');
    if (pos && (pos as any).setUsage) (pos as any).setUsage(THREE.DynamicDrawUsage);

    // Создание фигуры
    const mesh = new THREE.Mesh(geom, BASE_MATERIAL);

    mesh.layers.enable(0);

    // внешние рёбра
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: EDGES_DEFAULT_COLOR, linewidth: 1 }),
    );
    line.layers.set(1);

    mesh.add(line);

    // Добавление фигуры на сцену
    this._api.addMesh(mesh);
    this._lastAddedMesh = mesh;
  }

  /** Срабатывает только на `ctrl + z`. */
  public rollback(): void {
    // Если добавляли какую-то фигуру на сцену.
    if (this._lastAddedMesh !== null) {
      this._api.removeMesh(this._lastAddedMesh);
      // Очистка сохраненной фигуры
      this._lastAddedMesh = null;
    }
  }

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {
    // Очистка сохраненной фигуры
    this._lastAddedMesh = null;
  }
}
