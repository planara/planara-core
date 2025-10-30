// Core
import * as THREE from 'three';
// Interfaces
import type { IMeshApi } from '../interfaces/api/mesh-api';
import type { ITransformHelpersApi } from '../interfaces/api/transform-helpers-api';
import type { IRaycastAPI } from '../interfaces/api/raycast-api';
// IOC
import { inject, injectable } from 'tsyringe';
// Types
import type { EditorRenderer } from '../core/editor-renderer';
import type { SelectMode, ToolType } from '@planara/types';
import type { ISceneApi } from '../interfaces/api/scene-api';

/**
 * API для EditorRenderer
 * @internal
 */
@injectable()
export class RendererApi implements IMeshApi, ITransformHelpersApi, IRaycastAPI, ISceneApi {
  public constructor(@inject('EditorRenderer') private _renderer: EditorRenderer) {}

  /** @inheritdoc */
  public addMesh(mesh: THREE.Mesh): void {
    this._renderer.addMesh(mesh);
  }

  /** @inheritdoc */
  public addMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.addMesh(mesh);
    }
  }

  /** @inheritdoc */
  public removeMesh(mesh: THREE.Mesh): void {
    this._renderer.removeMesh(mesh);
  }

  /** @inheritdoc */
  public removeMeshes(meshes: THREE.Mesh[]): void {
    for (const mesh of meshes) {
      this._renderer.removeMesh(mesh);
    }
  }

  /** @inheritdoc */
  public getMeshes(): THREE.Mesh[] {
    return this._renderer.getMeshes();
  }

  /** @inheritdoc */
  public setMode(tool: ToolType): void {
    this._renderer.setTransformControlsMode(tool);
  }

  /** @inheritdoc */
  public attach(obj: THREE.Object3D): void {
    this._renderer.attachTransformControls(obj);
  }

  /** @inheritdoc */
  public detach(): void {
    this._renderer.detachTransformControls();
  }

  /** @inheritdoc */
  public setRaycastMode(mode: SelectMode): void {
    this._renderer.setRaycastMode(mode);
  }

  /** @inheritdoc */
  public addObject(obj: THREE.Object3D, layer?: number): void {
    this._renderer.addObject(obj, layer);
  }

  /** @inheritdoc */
  public removeObject(obj: THREE.Object3D): void {
    this._renderer.removeObject(obj);
  }

  /** @inheritdoc */
  public enableCameraLayer(layer: number): void {
    this._renderer.enableCameraLayer(layer);
  }
}
