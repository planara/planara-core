// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IInteractionApi, IMetricsApi, ISceneApi } from '@/interfaces/api';
import type { IMetricsStore } from '@/interfaces/store';
// Handlers
import { BaseBenchmarkHandler } from '@/handlers/benchmark';
// Types
import { BenchmarkTestType } from '@planara/types';
// Shared
import {
  MIXED_HARD_OBJECTS_COUNT,
  MIXED_LIGHT_OBJECTS_COUNT,
  MIXED_MEDIUM_OBJECTS_COUNT,
} from '@/shared/constants';

/**
 * Хендлер смешанного benchmark-теста.
 *
 * @remarks
 * Формирует небольшую тестовую сцену из простых объектов.
 *
 * @internal
 * @class
 */
@injectable()
export class MixedBenchmarkHandler extends BaseBenchmarkHandler {
  /** Тип benchmark-теста. */
  public readonly mode: BenchmarkTestType = BenchmarkTestType.Mixed;

  /** Название группы тестовых объектов. */
  protected readonly groupName = '__MIXED_BENCHMARK__';

  /** Количество объектов в тестовой сцене. */
  protected readonly objectsCount =
    MIXED_LIGHT_OBJECTS_COUNT + MIXED_MEDIUM_OBJECTS_COUNT + MIXED_HARD_OBJECTS_COUNT;

  public constructor(
    @inject('ISceneApi') sceneApi: ISceneApi,
    @inject('IInteractionApi') interactionApi: IInteractionApi,
    @inject('IMetricsApi') metricsApi: IMetricsApi,
    @inject('MetricsStore') store: IMetricsStore,
  ) {
    super(sceneApi, interactionApi, metricsApi, store);
  }

  /**
   * Заполняет группу объектами смешанного benchmark-теста.
   *
   * @param group - группа benchmark-теста
   *
   * @internal
   * @method
   */
  protected fillGroup(group: THREE.Group): void {
    this._addLightObjects(group, -10);
    this._addMediumObjects(group, 0);
    this._addHardObjects(group, 10);
  }

  private _addLightObjects(group: THREE.Group, offsetX: number): void {
    this._addGrid(group, MIXED_LIGHT_OBJECTS_COUNT, offsetX, () => {
      return new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial());
    });
  }

  private _addMediumObjects(group: THREE.Group, offsetX: number): void {
    this._addGrid(group, MIXED_MEDIUM_OBJECTS_COUNT, offsetX, () => {
      return new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24),
        new THREE.MeshStandardMaterial(),
      );
    });
  }

  private _addHardObjects(group: THREE.Group, offsetX: number): void {
    this._addGrid(group, MIXED_HARD_OBJECTS_COUNT, offsetX, () => {
      return new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.16, 0.05, 64, 12),
        new THREE.MeshStandardMaterial(),
      );
    });
  }

  private _addGrid(
    group: THREE.Group,
    count: number,
    offsetX: number,
    factory: (index: number) => THREE.Mesh,
  ): void {
    const size = Math.ceil(Math.sqrt(count));
    const offset = size / 2;

    for (let i = 0; i < count; i += 1) {
      const x = i % size;
      const z = Math.floor(i / size);

      const mesh = factory(i);
      mesh.position.set(offsetX + (x - offset) * 0.65, 0.25, (z - offset) * 0.65);

      group.add(mesh);
    }
  }
}
