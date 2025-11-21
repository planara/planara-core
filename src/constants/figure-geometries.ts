// Core
import * as THREE from 'three';
// Types
import { FigureType } from '@planara/types';

/**
 * Базовые фабрики геометрий по типу фигуры.
 * Всегда создают новый экземпляр — безопасно для редактирования вершин.
 */
export const BASE_GEOMETRIES: Record<FigureType, () => THREE.BufferGeometry> = {
  [FigureType.Plane]: () => new THREE.PlaneGeometry(1, 1, 1, 1),
  [FigureType.Cube]: () => new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),
  [FigureType.UVSphere]: () => new THREE.SphereGeometry(0.5, 32, 16),
  [FigureType.Icosphere]: () => new THREE.IcosahedronGeometry(0.5, 0),
  [FigureType.Cylinder]: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, false),
  [FigureType.Cone]: () => new THREE.ConeGeometry(0.5, 1, 32, 1, false),
  [FigureType.Torus]: () => new THREE.TorusGeometry(0.5, 0.2, 16, 64),
  [FigureType.Circle]: () => new THREE.CircleGeometry(0.5, 32),
  [FigureType.Sphere]: () => new THREE.SphereGeometry(0.5, 32, 16),
  [FigureType.Custom]: function (): THREE.BufferGeometry {
    throw new Error('Custom geometry is not generated here.');
  },
};

/** Базовый материал для фигур */
export const BASE_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xbfbfbf,
  metalness: 0.0,
  roughness: 0.6,
});

/** Базовый размер вершины. */
export const BASE_POINT_SIZE = 8;
