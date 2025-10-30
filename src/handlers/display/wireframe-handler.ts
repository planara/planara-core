// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IDisplayHandler } from '../../interfaces/handler/display-handler';
// Types
import { DisplayMode } from '@planara/types';
import type { IMeshApi } from '../../interfaces/api/mesh-api';

/**
 * Хендлер для включения wireframe-режима.
 * Управляет сценой через RendererApi.
 * @internal
 */
@injectable()
export class WireframeHandler implements IDisplayHandler {
  /** Режим отображения. */
  public readonly mode: DisplayMode = DisplayMode.Wireframe;

  /** Сохраняем предыдущие значения wireframe для отката. */
  private _prevWireframe = new Map<THREE.Material, boolean>();

  /** Сохраняем исходные цвета материалов для отката */
  private _prevColorMesh = new Map<THREE.Material, THREE.Color>();
  private _prevColorLines = new Map<THREE.LineBasicMaterial, THREE.Color>();

  /** Цвет ребер для wireframe-режима. */
  private _wireColor = new THREE.Color(0x00ffff);

  public constructor(@inject('RendererApi') private _api: IMeshApi) {}

  /** Применяет wireframe-режим к сцене. */
  public handle(): void {
    const meshes = this._api.getMeshes();

    for (const mesh of meshes) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) this._enableWireframeOnMaterial(m);

      mesh.traverse((obj) => {
        if ((obj as any).isLineSegments) {
          const line = obj as THREE.LineSegments;

          if (!this._prevColorLines.has(line.material as THREE.LineBasicMaterial)) {
            const lbm = line.material as THREE.LineBasicMaterial;
            this._prevColorLines.set(lbm, lbm.color.clone());
          }

          const mat = line.material as THREE.LineBasicMaterial;
          mat.color.copy(this._wireColor);
          mat.needsUpdate = true;
        }
      });
    }
  }

  /** Отключает wireframe-режим и возвращает оригинальные меши. */
  public rollback(): void {
    // Mesh-материалы: отключение wireframe-режима и возвращение цвета
    for (const [mat, prev] of this._prevWireframe) {
      if ('wireframe' in (mat as any)) (mat as any).wireframe = prev;
      (mat as THREE.Material).needsUpdate = true;
    }

    this._prevWireframe.clear();

    for (const [mat, color] of this._prevColorMesh) {
      const anyMat = mat as any;
      if (anyMat.color?.isColor) anyMat.color.copy(color);
    }

    this._prevColorMesh.clear();

    // LineSegments: возвращение исходного цвета ребер
    for (const [lbm, color] of this._prevColorLines) {
      lbm.color.copy(color);
    }
    this._prevColorLines.clear();
  }

  /** Освобождает ресурсы хендлера, удаляет слушатели и очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    this.rollback();
  }

  /** Изменить цвет, который будет применяться в режиме wireframe. */
  private _enableWireframeOnMaterial(mat: THREE.Material): void {
    const anyMat = mat as any;

    // Wireframe-флаг
    if ('wireframe' in anyMat && !this._prevWireframe.has(mat)) {
      this._prevWireframe.set(mat, Boolean(anyMat.wireframe));
      anyMat.wireframe = true;
      mat.needsUpdate = true;
    }

    // Цвет материала меша
    if (anyMat.color?.isColor) {
      if (!this._prevColorMesh.has(mat)) this._prevColorMesh.set(mat, anyMat.color.clone());
      anyMat.color.copy(this._wireColor);
    }
  }
}
