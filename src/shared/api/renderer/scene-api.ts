// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ISceneApi } from '@/interfaces/api';
import type { IRendererSceneAccess } from '@/interfaces/api/renderer';

/**
 * Реализация API для управления сценой.
 *
 * @remarks
 * Делегирует вызовы к {@link IRendererSceneAccess},
 * что позволяет изолировать логику управления сценой от конкретной реализации рендерера.
 *
 * @see {@link ISceneApi} - интерфейс, который реализует этот класс
 * @see {@link IRendererSceneAccess} - низкоуровневый доступ к сцене
 * @see {@link Renderer} - рендерер, предоставляющий доступ к сцене
 *
 * @internal
 * @class
 */
@injectable()
export class SceneApi implements ISceneApi {
  public constructor(
    @inject('IRendererSceneAccess') private _sceneAccessApi: IRendererSceneAccess,
  ) {}

  public getScene(): THREE.Scene {
    return this._sceneAccessApi.getScene();
  }

  public addToScene(object: THREE.Object3D): void {
    this._sceneAccessApi.getScene().add(object);
  }

  public removeFromScene(object: THREE.Object3D, dispose?: boolean): void {
    this._sceneAccessApi.getScene().remove(object);

    if (dispose) {
      this._disposeObject(object);
    }
  }

  public addObject(object: THREE.Object3D, layer?: number) {
    // Получение сцены рендерера
    const scene: THREE.Scene = this._sceneAccessApi.getScene();

    if (!scene) return;

    if (typeof layer === 'number') {
      object.layers.set(layer);
    }
    scene.add(object);
  }

  /**
   * Освобождает ресурсы объекта и его дочерних элементов.
   *
   * @param object - объект для очистки
   *
   * @private
   * @method
   */
  private _disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach((material) => this._disposeMaterial(material));
        return;
      }

      this._disposeMaterial(child.material);
    });
  }

  /**
   * Освобождает ресурсы материала.
   *
   * @param material - материал для очистки
   *
   * @private
   * @method
   */
  private _disposeMaterial(material: THREE.Material): void {
    Object.values(material).forEach((value) => {
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    });

    material.dispose();
  }
}
