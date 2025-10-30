// Core
import * as THREE from 'three';
// Types
import type { DisplayMode, SelectMode, ToolType } from '@planara/types';
import type { SelectedListener } from '../../types/listener/selected-listener';

export interface IEditorStore {
  /** Возвращает текущий режим выбора. */
  getSelectMode(): SelectMode;

  /** Возвращает текущий активный инструмент. */
  getToolType(): ToolType;

  /** Возвращает текущий режим отображения. */
  getDisplayMode(): DisplayMode;

  /**
   * Устанавливает режим выбора.
   * @param mode - Режим выбора (Mesh/Face/Edge/Vertex и т.п.).
   */
  setSelectMode(mode: SelectMode): void;

  /**
   * Устанавливает активный инструмент.
   * @param toolType - Тип инструмента (Translate/Rotate/Scale и т.п.).
   */
  setToolType(toolType: ToolType): void;

  /**
   * Устанавливает режим отображения.
   * @param mode - Режим отображения (зависит от твоего домена).
   */
  setDisplayMode(mode: DisplayMode): void;

  /**
   * Возвращает текущий выбранный объект сцены.
   * @remarks
   * Предполагается, что до вызова этого метода уже был
   * вызван {@link setSelectedObject}. Иначе результат не определён.
   */
  getSelectedObject(): THREE.Object3D | null;

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
