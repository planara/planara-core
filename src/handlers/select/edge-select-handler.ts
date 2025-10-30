// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { IEditorApi } from '../../types/api/editor-api';
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Types
import { SelectMode } from '@planara/types';
// Events
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { SelectEventType } from '../../types/event/select-event-type';
// Constants
import { HOVER_COLOR, SELECT_COLOR } from '../../constants/colors';
import { OVERLAY_LAYER } from '../../constants/layers';

/**
 * Хендлер для выборки ребер.
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет грани конкретной модели из payload, в случае null возвращает исходное состояние.
 * @internal
 */
@injectable()
export class EdgeSelectHandler implements ISelectHandler {
  /** Режим, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: SelectMode = SelectMode.Edge;

  /** Текущее наведённое ребро. */
  private readonly _hoverLine: THREE.Line;
  /** Текущее выбранное ребро. */
  private readonly _selectLine: THREE.Line;

  /** Текущее наведённое ребро из массива `LineSegments` модели. */
  private _hovered: { lines: THREE.LineSegments; seg: number } | null = null;
  /** Текущее выбранное ребро из массива `LineSegments` модели. */
  private _selected: { lines: THREE.LineSegments; seg: number } | null = null;

  // Цвета, необходимые для переключения
  /** Цвет ребра, на которое навелись */
  private readonly _hoverColor = HOVER_COLOR;
  /** Цвет выделенного ребра */
  private readonly _selectColor = SELECT_COLOR;

  public constructor(
    @inject('RendererApi') private _api: IEditorApi,
    @inject('IEditorStore') private _store: IEditorStore,
  ) {
    // Устанавливаем слой отображения линий для камеры
    this._api.enableCameraLayer(OVERLAY_LAYER);

    // Создание линий для добавления на сцену
    this._hoverLine = this._makeOverlayLine(this._hoverColor);
    this._selectLine = this._makeOverlayLine(this._selectColor);

    // Добавление линий на сцену
    this._api.addObject(this._hoverLine, OVERLAY_LAYER);
    this._api.addObject(this._selectLine, OVERLAY_LAYER);
  }

  /** Обработка текущего режима выборки. */
  public handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    // Устанавливаем режим обработки пересечений для Raycaster
    this._api.setRaycastMode(this.mode);

    // Обработка hover-события
    if (type === SelectEventType.Hover) {
      if (!payload) {
        this._hoverLine.visible = false;
        this._hovered = null;
        return;
      }
      const obj = payload.intersection.object as any;
      if (!obj?.isLineSegments) return;

      const lines = obj as THREE.LineSegments;
      const seg = Math.floor((payload.intersection.index ?? -1) / 2);
      if (seg < 0) return;

      // если ховер совпал с выбранным — можно скрыть ховер
      if (this._selected && this._same({ lines, seg }, this._selected)) {
        this._hoverLine.visible = false;
      } else {
        this._writeWorldSegment(this._hoverLine, lines, seg);
        this._hoverLine.visible = true;
      }
      this._hovered = { lines, seg };
      return;
    }

    // Обработка click-события
    if (type === SelectEventType.Click) {
      if (!payload) {
        this._selectLine.visible = false;
        this._selected = null;
        this._store.setSelectedObject(null);
        return;
      }
      const obj = payload.intersection.object as any;
      if (!obj?.isLineSegments) return;

      const lines = obj as THREE.LineSegments;
      const seg = Math.floor((payload.intersection.index ?? -1) / 2);
      if (seg < 0) return;

      this._writeWorldSegment(this._selectLine, lines, seg);
      this._centerAndOrientLineOnSegment(this._selectLine, lines, seg);
      this._selectLine.visible = true;

      // Сохранение выбранного объекта в store
      this._store.setSelectedObject(this._selectLine);
      this._selected = { lines, seg };

      if (this._hovered && this._same(this._hovered, this._selected)) {
        this._hoverLine.visible = false;
      }
    }
  }

  /** Откат текущего режима выборки */
  public rollback(): void {
    // Скрываем линии
    this._hoverLine.visible = false;
    this._selectLine.visible = false;

    // Удаляем сохраненные пересечения
    this._hovered = this._selected = null;
  }

  /** Освобождает ресурсы хендлера, удаляет слушатели и очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    this.rollback();
    // Убираем линии со сцены
    this._api.removeObject(this._hoverLine);
    this._api.removeObject(this._selectLine);

    // Очищаем ресурсы линий
    this._hoverLine.geometry.dispose();
    (this._hoverLine.material as THREE.Material).dispose();

    this._selectLine.geometry.dispose();
    (this._selectLine.material as THREE.Material).dispose();
  }

  private _makeOverlayLine(color: number): THREE.Line {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(6, 3));

    // Создание материала для линии
    const m = new THREE.LineBasicMaterial({
      color,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 1,
    });

    // Создание линии, которую будем использовать при пересечениях
    const line = new THREE.Line(g, m);
    line.renderOrder = 1000;
    // Не мешаем raycast
    (line as any).raycast = () => {};
    // Задаем слой отображения
    line.layers.set(OVERLAY_LAYER);
    // Изначально линия скрыта
    line.visible = false;
    return line;
  }

  /** Локальные точки сегмента переводим в target (который висит на сцене) */
  private _writeWorldSegment(target: THREE.Line, lines: THREE.LineSegments, seg: number) {
    const src = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const i0 = seg * 2,
      i1 = i0 + 1;

    const a = new THREE.Vector3(src.getX(i0), src.getY(i0), src.getZ(i0)).applyMatrix4(
      lines.matrixWorld,
    );
    const b = new THREE.Vector3(src.getX(i1), src.getY(i1), src.getZ(i1)).applyMatrix4(
      lines.matrixWorld,
    );

    const dst = target.geometry.getAttribute('position') as THREE.BufferAttribute;
    dst.setXYZ(0, a.x, a.y, a.z);
    dst.setXYZ(1, b.x, b.y, b.z);
    dst.needsUpdate = true;
  }

  private _same(
    a: { lines: THREE.LineSegments; seg: number } | null,
    b: { lines: THREE.LineSegments; seg: number } | null,
  ) {
    return !!a && !!b && a.lines === b.lines && a.seg === b.seg;
  }

  /** Центрует `THREE.Line` на сегменте и ориентирует её вдоль ребра */
  private _centerAndOrientLineOnSegment(line: THREE.Line, lines: THREE.LineSegments, seg: number) {
    const src = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const i0 = seg * 2,
      i1 = i0 + 1;

    // Концы ребра
    const A = new THREE.Vector3(src.getX(i0), src.getY(i0), src.getZ(i0)).applyMatrix4(
      lines.matrixWorld,
    );
    const B = new THREE.Vector3(src.getX(i1), src.getY(i1), src.getZ(i1)).applyMatrix4(
      lines.matrixWorld,
    );

    const dir = new THREE.Vector3().subVectors(B, A);
    const len = dir.length();
    if (!isFinite(len) || len === 0) return;

    // позиция в середину
    const mid = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5);
    line.position.copy(mid);

    const g = line.geometry as THREE.BufferGeometry;
    let dst = g.getAttribute('position') as THREE.BufferAttribute | null;
    if (!dst || dst.count < 2) {
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      dst = g.getAttribute('position') as THREE.BufferAttribute;
    }
    dst.setXYZ(0, -len / 2, 0, 0);
    dst.setXYZ(1, len / 2, 0, 0);
    dst.needsUpdate = true;

    dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
    line.quaternion.copy(q);

    line.updateMatrixWorld(true);
  }
}
