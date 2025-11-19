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

      // Проверка на входящее пересечение (является ли оно пересечением ребер конкретной фигуры на сцене)
      const obj = payload.intersection.object as any;
      if (!obj?.isLineSegments) return;

      const lines = obj as THREE.LineSegments;
      const seg = Math.floor((payload.intersection.index ?? -1) / 2);
      if (seg < 0) return;

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

      // Проверка на входящее пересечение (является ли оно пересечением ребер конкретной фигуры на сцене)
      const obj = payload.intersection.object as any;
      if (!obj?.isLineSegments) return;

      const lines = obj as THREE.LineSegments;
      const seg = Math.floor((payload.intersection.index ?? -1) / 2);
      if (seg < 0) return;

      this._writeWorldSegment(this._selectLine, lines, seg);
      this._centerAndOrientLineOnSegment(this._selectLine, lines, seg);
      this._selectLine.visible = true;

      // Подготовка и запись метаданных для выбранного ребра
      this._prepareEdgeMetadata(lines, seg);

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

  /** Инициализация буферных линий для режима (hover и click).
   * На весь режим будет использовано 2 глобальных линии на сцене,
   * использоваться они будут только для обозначения геометрии ребер конкретной фигуры.
   */
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

  /** Поиск родителя ребер (сама фигура) */
  private _findParentMesh(obj: THREE.Object3D | null): THREE.Mesh | null {
    let cur: THREE.Object3D | null = obj;
    while (cur) {
      if ((cur as any).isMesh) return cur as THREE.Mesh;
      cur = cur.parent;
    }
    return null;
  }

  /** Запись метаданных выбранного ребра для использования инструментов */
  private _prepareEdgeMetadata(lines: THREE.LineSegments, seg: number) {
    // Поиск исходной фигуры по родителям
    const mesh = this._findParentMesh(lines);
    if (!mesh) return;

    // Поиск мировых точек A и B по LineSegments
    const src = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const i0 = seg * 2;
    const i1 = i0 + 1;

    const A_world = new THREE.Vector3(src.getX(i0), src.getY(i0), src.getZ(i0)).applyMatrix4(
      lines.matrixWorld,
    );

    const B_world = new THREE.Vector3(src.getX(i1), src.getY(i1), src.getZ(i1)).applyMatrix4(
      lines.matrixWorld,
    );

    // Перевод их в локальные координаты меша
    const toLocalMesh = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const A_local = A_world.clone().applyMatrix4(toLocalMesh);
    const B_local = B_world.clone().applyMatrix4(toLocalMesh);

    // Поиск всех вершин в geometry, которые совпадают с A_local / B_local
    const meshGeo = mesh.geometry as THREE.BufferGeometry;
    const pos = meshGeo.getAttribute('position') as THREE.BufferAttribute;
    const tmp = new THREE.Vector3();
    const EPS = 1e-6;

    const aIndices: number[] = [];
    const bIndices: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      tmp.fromBufferAttribute(pos, i);

      if (tmp.distanceToSquared(A_local) < EPS * EPS) {
        aIndices.push(i);
      } else if (tmp.distanceToSquared(B_local) < EPS * EPS) {
        bIndices.push(i);
      }
    }

    const toLocalLines = new THREE.Matrix4().copy(lines.matrixWorld).invert();
    const A_localLines = A_world.clone().applyMatrix4(toLocalLines);
    const B_localLines = B_world.clone().applyMatrix4(toLocalLines);

    const edgePos = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const tmpEdge = new THREE.Vector3();

    const aEdgeIndices: number[] = [];
    const bEdgeIndices: number[] = [];

    for (let i = 0; i < edgePos.count; i++) {
      tmpEdge.fromBufferAttribute(edgePos, i);

      if (tmpEdge.distanceToSquared(A_localLines) < EPS * EPS) {
        aEdgeIndices.push(i);
      } else if (tmpEdge.distanceToSquared(B_localLines) < EPS * EPS) {
        bEdgeIndices.push(i);
      }
    }

    // Запись в метаданные объекта (линии) необходимые для инструментов поля
    // Идея такая, что сами TransformControls будут доставать из THREE.Line фигуру, индекс ребра и вершины,
    // а затем транслировать изменение прокси-ребра на саму модель
    this._selectLine.userData.edgeInfo = {
      lines,
      seg,
      mesh,
      aIndices,
      bIndices,
      aEdgeIndices,
      bEdgeIndices,
    };
  }
}
