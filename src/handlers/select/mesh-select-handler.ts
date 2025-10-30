// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';
import type { IRaycastAPI } from '../../interfaces/api/raycast-api';
// Types
import { SelectMode } from '@planara/types';
// Events
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { SelectEventType } from '../../types/event/select-event-type';
// Constants
import { HOVER_COLOR, SELECT_COLOR } from '../../constants/colors';

/**
 * Хендлер для выборки моделей.
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет ребер конкретной модели из payload, в случае null возвращает исходное состояние.
 * @internal
 */
@injectable()
export class MeshSelectHandler implements ISelectHandler {
  /** Режим, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: SelectMode = SelectMode.Mesh;

  /** Фигура, на которую навелись в данный момент */
  private _hoveredMesh: THREE.Mesh | null = null;
  /** Фигура, которую выбрали в данный момент */
  private _selectedMesh: THREE.Mesh | null = null;

  // Цвета, необходимые для переключения
  /** Цвет ребер для фигуры, на которую навелись */
  private readonly _hoverColor = HOVER_COLOR;
  /** Цвет ребер для выделенной фигуры */
  private readonly _selectColor = SELECT_COLOR;
  /** Изначальный цвет ребер у модели, перед наложением эффектов*/
  private readonly _defaultColor = 0x222222;

  public constructor(
    @inject('RendererApi') private _api: IRaycastAPI,
    @inject('IEditorStore') private _store: IEditorStore,
  ) {}

  public handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    this._api.setRaycastMode(this.mode);
    // Событие hover
    if (type === SelectEventType.Hover) {
      if (!payload) {
        // Мышь убрана с модели
        if (this._hoveredMesh && this._hoveredMesh !== this._selectedMesh) {
          this._setEdgesColor(this._hoveredMesh, this._defaultColor);
        }
        this._hoveredMesh = null;
        return;
      }

      const mesh = payload.intersection.object as THREE.Mesh;

      if (this._hoveredMesh !== mesh) {
        // Вернуть цвет предыдущего hover, если это не выбранный mesh
        if (this._hoveredMesh && this._hoveredMesh !== this._selectedMesh) {
          this._setEdgesColor(this._hoveredMesh, this._defaultColor);
        }

        // Подсветка нового hover (если это не выбранный)
        if (mesh !== this._selectedMesh) this._setEdgesColor(mesh, this._hoverColor);

        this._hoveredMesh = mesh;
      }
    }

    // Событие click
    if (type === SelectEventType.Click) {
      if (!payload) {
        // Сброс выделения на клик в пустом месте
        if (this._selectedMesh) {
          this._setEdgesColor(this._selectedMesh, this._defaultColor);
          this._selectedMesh = null;
          this._store.setSelectedObject(null);
        }
        return;
      }

      const mesh = payload.intersection.object as THREE.Mesh;

      // Сброс цвета предыдущего selected
      if (this._selectedMesh && this._selectedMesh !== mesh) {
        this._setEdgesColor(this._selectedMesh, this._defaultColor);
      }

      // Подсветка нового selected
      this._setEdgesColor(mesh, this._selectColor);
      // Сохранение выбранного объекта
      this._selectedMesh = mesh;
      this._store.setSelectedObject(mesh);
    }
  }

  public rollback(): void {
    // Возвращение исходного цвета для моделей
    if (this._hoveredMesh) this._setEdgesColor(this._hoveredMesh, this._defaultColor);
    if (this._selectedMesh) this._setEdgesColor(this._selectedMesh, this._defaultColor);

    // Очистка записей о моделях
    this._hoveredMesh = this._selectedMesh = null;
  }

  /** Освобождает ресурсы хендлера, удаляет слушатели и очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    this.rollback();
  }

  /** вспомогательный метод для изменения цвета ребер меша */
  private _setEdgesColor(mesh: THREE.Mesh, color: number) {
    mesh.children.forEach((child) => {
      if ((child as THREE.LineSegments).type === 'LineSegments') {
        const line = child as THREE.LineSegments;
        (line.material as THREE.LineBasicMaterial).color.setHex(color);
      }
    });
  }
}
