// Core
import * as THREE from 'three';

/**
 * Группа треугольников, образующих одну логическую грань.
 * @internal
 */
export type FaceGroup = {
  /** Меш, которому принадлежит грань. */
  mesh: THREE.Mesh;

  /** Стартовый triangle index, полученный из raycast. */
  faceIndex: number;

  /** Индексы треугольников, входящих в грань. */
  triangleIndices: number[];
};
