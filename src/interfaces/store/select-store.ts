// Core
import * as THREE from 'three';
// Types
import type { FigureTransform, SelectMode } from '@planara/types';
// Listeners
import type { SelectedListener } from '../../types/listener/selected-listener';

/**
 * Интерфейс store для менеджеров и хендлеров, которые позволяют работать с Select фичей,
 * необходим для корректного взаимодействия между группами фичей.
 *
 * Можно получить:
 * - режим выборки
 * - выбранный объект
 * - подписаться на изменение объекта
 *
 * @public
 * @interface
 */
export interface ISelectStore {
  /** Возвращает текущий режим выбора. */
  getSelectMode(): SelectMode;

  /**
   * Устанавливает режим выбора.
   * @param mode - Режим выбора (Mesh/Face/Edge/Vertex и т.п.).
   */
  setSelectMode(mode: SelectMode): void;

  /**
   * Возвращает текущий выбранный объект сцены.
   * @remarks
   * Предполагается, что до вызова этого метода уже был
   * вызван {@link ISelectStore.setSelectedObject}. Иначе результат не определён.
   */
  getSelectedObject(): THREE.Object3D | null;

  /** Возвращает актуальную статистику по трансформации выбранного объекта. */
  getSelectionStats(): FigureTransform | null;

  /**
   * Устанавливает текущий выбранный объект сцены.
   * @param object - Ссылка на объект `THREE.Object3D`, который считается выбранным.
   */
  setSelectedObject(object: THREE.Object3D | null): void;

  /**
   * Регистрирует callback, вызываемый при каждом изменении выбранного 3D-объекта.
   * @param cb - Callback, получающий текущий выбранный объект (`THREE.Object3D | null`).
   */
  onSelectedObjectChange(cb: SelectedListener): () => void;
}
