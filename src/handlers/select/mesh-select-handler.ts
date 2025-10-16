// Core
import * as THREE from 'three';
// IOC
import { injectable } from 'tsyringe';
// Interfaces
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
// Types
import { SelectMode } from '@planara/types';
// Events
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { SelectEventType } from '../../types/event/select-event-type';

/**
 * Хендлер для выборки моделей.
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет ребер конкретной модели из payload, в случае null возвращает исходное состояние.
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
  /** Цвет граней для фигуры, на которую навелись */
  private readonly _hoverColor = 0xffff00;
  /** Цвет граней для выделенной фигуры */
  private readonly _selectColor = 0xffaa00;
  /** Изначальный цвет граней у модели, перед наложением эффектов*/
  private readonly _defaultColor = 0x222222;

  constructor() {}

  handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    if (type === SelectEventType.Hover) {
      if (!payload) {
        // Мышь убрана с модели
        if (this._hoveredMesh && this._hoveredMesh !== this._selectedMesh) {
          this._setEdgesColor(this._hoveredMesh, this._defaultColor);
        }
        this._hoveredMesh = null;
        console.log('hover out');
        return;
      }

      const { mesh } = payload as { mesh: THREE.Mesh };

      if (this._hoveredMesh !== mesh) {
        // вернуть цвет предыдущего hover, если это не выбранный mesh
        if (this._hoveredMesh && this._hoveredMesh !== this._selectedMesh) {
          this._setEdgesColor(this._hoveredMesh, this._defaultColor);
        }

        // подсветка нового hover (если это не выбранный)
        if (mesh !== this._selectedMesh) this._setEdgesColor(mesh, this._hoverColor);

        this._hoveredMesh = mesh;
        console.log('hover in', mesh.name);
      }
    } else if (type === SelectEventType.Click) {
      if (!payload) {
        // сброс выделения на клик в пустом месте
        if (this._selectedMesh) {
          this._setEdgesColor(this._selectedMesh, this._defaultColor);
          this._selectedMesh = null;
          console.log('click cleared');
        }
        return;
      }

      const { mesh } = payload as { mesh: THREE.Mesh };

      // сброс цвета предыдущего selected
      if (this._selectedMesh && this._selectedMesh !== mesh) {
        this._setEdgesColor(this._selectedMesh, this._defaultColor);
      }

      // подсветка нового selected
      this._setEdgesColor(mesh, this._selectColor);
      this._selectedMesh = mesh;
    }
  }

  rollback(): void {
    // Возвращение исходного цвета для моделей
    if (this._hoveredMesh) this._setEdgesColor(this._hoveredMesh, this._defaultColor);
    if (this._selectedMesh) this._setEdgesColor(this._selectedMesh, this._defaultColor);

    // Очистка записей о моделях
    this._hoveredMesh = null;
    this._selectedMesh = null;
  }

  destroy(): void {
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
