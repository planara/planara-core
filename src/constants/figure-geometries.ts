// Core
import * as THREE from 'three';
// Types
import { FigureType } from '@planara/types';

/**
 * Фабрики геометрий для стандартных типов фигур.
 *
 * @remarks
 * Каждая фабрика создаёт **новый экземпляр** геометрии при вызове.
 * Это важно для редактирования вершин — изменения в одной геометрии
 * не влияют на другие экземпляры того же типа.
 *
 * Все геометрии создаются с единичными размерами (ширина/высота/глубина = 1
 * или радиус = 0.5).
 *
 * @example
 * ```typescript
 * // Создание куба
 * const geometry = BASE_GEOMETRIES[FigureType.Cube]();
 * const mesh = new THREE.Mesh(geometry, BASE_MATERIAL);
 * ```
 *
 * @see {@link FigureType} - типы доступных фигур
 *
 * @internal
 * @const
 */
export const BASE_GEOMETRIES: Record<FigureType, () => THREE.BufferGeometry> = {
  /**
   * Плоскость (PlaneGeometry)
   * @returns Плоскость размером 1x1 с одной сегментацией
   */
  [FigureType.Plane]: () => new THREE.PlaneGeometry(1, 1, 1, 1),

  /**
   * Куб (BoxGeometry)
   * @returns Куб размером 1x1x1 с одной сегментацией по каждой оси
   */
  [FigureType.Cube]: () => new THREE.BoxGeometry(1, 1, 1, 1, 1, 1),

  /**
   * Ультра-сфера (SphereGeometry) с гладкой поверхностью
   * @returns Сфера радиусом 0.5, 32 сегмента по ширине, 16 по высоте
   */
  [FigureType.UVSphere]: () => new THREE.SphereGeometry(0.5, 32, 16),

  /**
   * Икосфера (IcosahedronGeometry) — сфера из треугольников
   * @returns Икосфера радиусом 0.5, уровень детализации 0
   */
  [FigureType.Icosphere]: () => new THREE.IcosahedronGeometry(0.5, 0),

  /**
   * Цилиндр (CylinderGeometry)
   * @returns Цилиндр радиусом 0.5, высотой 1, 32 сегмента
   */
  [FigureType.Cylinder]: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, false),

  /**
   * Конус (ConeGeometry)
   * @returns Конус радиусом 0.5, высотой 1, 32 сегмента
   */
  [FigureType.Cone]: () => new THREE.ConeGeometry(0.5, 1, 32, 1, false),

  /**
   * Тор (TorusGeometry)
   * @returns Тор радиусом 0.5, толщиной 0.2, 16 сегментов по радиусу, 64 по трубке
   */
  [FigureType.Torus]: () => new THREE.TorusGeometry(0.5, 0.2, 16, 64),

  /**
   * Круг (CircleGeometry)
   * @returns Круг радиусом 0.5, 32 сегмента
   */
  [FigureType.Circle]: () => new THREE.CircleGeometry(0.5, 32),

  /**
   * Сфера (SphereGeometry) — алиас для UVSphere
   * @returns Сфера радиусом 0.5, 32 сегмента по ширине, 16 по высоте
   */
  [FigureType.Sphere]: () => new THREE.SphereGeometry(0.5, 32, 16),

  /**
   * Кастомная геометрия (не реализовано в фабрике)
   * @throws {Error} Всегда выбрасывает ошибку
   */
  [FigureType.Custom]: function (): THREE.BufferGeometry {
    throw new Error('Custom geometry is not generated here.');
  },
};

/**
 * Базовый материал для фигур.
 *
 * @remarks
 * Используется для всех стандартных фигур, создаваемых через `addFigure`.
 * Материал переиспользуется между фигурами, так как геометрия и так
 * создаётся заново для каждой фигуры.
 *
 * @example
 * ```typescript
 * // Использование с кастомной геометрией
 * const geometry = new THREE.BoxGeometry(2, 2, 2);
 * const mesh = new THREE.Mesh(geometry, BASE_MATERIAL);
 * ```
 *
 * @internal
 * @const
 */
export const BASE_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xbfbfbf,
  metalness: 0.0,
  roughness: 0.6,
});

/**
 * Базовый размер точек для вершин.
 *
 * @remarks
 * Используется при создании точек вершин для визуализации.
 * Размер задаётся в пикселях.
 *
 * @example
 * ```typescript
 * const points = makeVertexPoints(geometry);
 * points.material.size = BASE_POINT_SIZE;
 * ```
 *
 * @internal
 * @const
 */
export const BASE_POINT_SIZE = 8;
