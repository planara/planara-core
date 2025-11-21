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
import { BASE_POINT_SIZE } from '../../constants/figure-geometries';
import { OVERLAY_LAYER } from '../../constants/layers';
// Helpers
import { findParentMesh } from '../../utils/helpers';

/**
 * Хендлер для выборки вершин.
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет вершины конкретной модели из payload, в случае null возвращает исходное состояние.
 * @internal
 */
@injectable()
export class VertexSelectHandler implements ISelectHandler {
  /** Режим, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: SelectMode = SelectMode.Vertex;

  private _hovered: { points: THREE.Points; index: number } | null = null;
  private _selected: { points: THREE.Points; index: number } | null = null;

  /** Текущая наведённая вершина. */
  private readonly _hoverVertex: THREE.Points;
  /** Текущая выбранная вершина. */
  private readonly _selectVertex: THREE.Points;

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

    // Создание вершин для добавления на сцену
    this._hoverVertex = this._makeOverlayVertex(this._hoverColor);
    this._selectVertex = this._makeOverlayVertex(this._selectColor);

    // Добавление вершин на сцену
    this._api.addObject(this._hoverVertex, OVERLAY_LAYER);
    this._api.addObject(this._selectVertex, OVERLAY_LAYER);
  }

  public handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    // Устанавливаем режим обработки пересечений для Raycaster
    this._api.setRaycastMode(this.mode);

    // Обработка hover-события
    if (type === SelectEventType.Hover) {
      if (!payload) {
        this._hoverVertex.visible = false;
        this._hovered = null;

        return;
      }

      // Проверка на входящее пересечение (является ли оно пересечением вершин конкретной фигуры на сцене)
      const obj = payload.intersection.object as any;
      if (!obj?.isPoints) return;

      const points = obj as THREE.Points;
      const index = payload.intersection.index ?? -1;
      if (index < 0) return;

      if (this._selected && this._same({ points, index }, this._selected)) {
        this._hoverVertex.visible = false;
      } else {
        this._writeWorldVertex(this._hoverVertex, points, index);
        this._hoverVertex.visible = true;
      }

      return;
    }

    // Обработка click-события
    if (type === SelectEventType.Click) {
      if (!payload) {
        this._selectVertex.visible = false;
        this._selected = null;
        this._store.setSelectedObject(null);

        return;
      }

      // Проверка на входящее пересечение (является ли оно пересечением вершин конкретной фигуры на сцене)
      const obj = payload.intersection.object as any;
      if (!obj?.isPoints) return;

      const points = obj as THREE.Points;
      const index = payload.intersection.index ?? -1;
      if (index < 0) return;

      this._writeWorldVertex(this._selectVertex, points, index);
      this._centerVertexOnPoint(this._selectVertex, points, index);
      this._selectVertex.visible = true;

      // Подготовка и запись метаданных для выбранной вершины
      this._prepareVertexMetadata(points, index);

      // Сохранение выбранного объекта в store
      this._store.setSelectedObject(this._selectVertex);
      this._selected = { points, index };

      // если ховер совпал с выбранной — скрываем ховер
      if (this._hovered && this._same(this._hovered, this._selected)) {
        this._hoverVertex.visible = false;
      }

      return;
    }
  }

  public rollback(): void {
    // Скрываем вершины
    this._hoverVertex.visible = false;
    this._selectVertex.visible = false;

    // Удаляем сохраненные пересечения
    this._hovered = this._selected = null;
  }

  public dispose(): Promise<void> | void {
    this.rollback();

    // Убираем вершины со сцены
    this._api.removeObject(this._hoverVertex);
    this._api.removeObject(this._selectVertex);

    // Очищаем ресурсы линий
    this._hoverVertex.geometry.dispose();
    (this._hoverVertex.material as THREE.Material).dispose();

    this._selectVertex.geometry.dispose();
    (this._selectVertex.material as THREE.Material).dispose();
  }

  private _makeOverlayVertex(color: number, size = BASE_POINT_SIZE): THREE.Points {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3));

    // Подготовка материалов
    const m = new THREE.PointsMaterial({
      color,
      size,
      sizeAttenuation: false,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 1,
    });

    const p = new THREE.Points(g, m);
    p.renderOrder = 1000;
    // Не мешаем raycast
    (p as any).raycast = () => {};
    // Задаем слой отображения
    p.layers.set(OVERLAY_LAYER);
    // Изначально вершина скрыта
    p.visible = false;

    return p;
  }

  /** Локальную вершину points переводим в world и пишем в target (прокси-точку) */
  private _writeWorldVertex(target: THREE.Points, points: THREE.Points, index: number) {
    const src = points.geometry.getAttribute('position') as THREE.BufferAttribute;

    const vWorld = new THREE.Vector3(
      src.getX(index),
      src.getY(index),
      src.getZ(index),
    ).applyMatrix4(points.matrixWorld);

    const dst = target.geometry.getAttribute('position') as THREE.BufferAttribute;
    dst.setXYZ(0, vWorld.x, vWorld.y, vWorld.z);
    dst.needsUpdate = true;
  }

  private _same(
    a: { points: THREE.Points; index: number } | null,
    b: { points: THREE.Points; index: number } | null,
  ) {
    return !!a && !!b && a.points === b.points && a.index === b.index;
  }

  /** Готовит метаданные для выбранной вершины и пишет их в _selectVertex.userData */
  private _prepareVertexMetadata(points: THREE.Points, index: number) {
    // Поиск исходной фигуры по родителям
    const mesh = findParentMesh(points);
    if (!mesh) return;

    // Получение мировой позиции выбранной вершины
    const pAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute;

    const P_world = new THREE.Vector3(
      pAttr.getX(index),
      pAttr.getY(index),
      pAttr.getZ(index),
    ).applyMatrix4(points.matrixWorld);

    // Перевод их в локальные координаты меша
    const toLocalMesh = new THREE.Matrix4().copy(mesh.matrixWorld).invert();
    const P_localMesh = P_world.clone().applyMatrix4(toLocalMesh);

    // Поиск всех вершин в geometry, которые совпадают локальными
    const meshGeo = mesh.geometry as THREE.BufferGeometry;
    const meshPos = meshGeo.getAttribute('position') as THREE.BufferAttribute;

    const EPS = 1e-6;
    const EPS2 = EPS * EPS;
    const tmp = new THREE.Vector3();

    const vertexIndices: number[] = [];

    for (let i = 0; i < meshPos.count; i++) {
      tmp.fromBufferAttribute(meshPos, i);
      if (tmp.distanceToSquared(P_localMesh) < EPS2) {
        vertexIndices.push(i);
      }
    }

    // найдём LineSegments (оверлей рёбер) как ребёнка меша
    const lines = mesh.children.find((c) => (c as any)?.isLineSegments) as
      | THREE.LineSegments
      | undefined;

    let edgeVertexIndices: number[] = [];

    if (lines) {
      // P_localMesh у тебя уже есть, можно сравнивать в локалке lines
      const toLocalLines = new THREE.Matrix4().copy(lines.matrixWorld).invert();
      const P_localLines = P_world.clone().applyMatrix4(toLocalLines);

      const lPos = lines.geometry.getAttribute('position') as THREE.BufferAttribute;
      const tmp2 = new THREE.Vector3();

      for (let i = 0; i < lPos.count; i++) {
        tmp2.fromBufferAttribute(lPos, i);
        if (tmp2.distanceToSquared(P_localLines) < EPS2) {
          edgeVertexIndices.push(i);
        }
      }
    }

    // Запись в метаданные объекта (линии) необходимые для инструментов поля
    // Идея такая, что сами TransformControls будут доставать из THREE.Points фигуру, индекс вершины,
    // а затем транслировать изменение прокси-вершины на саму модель
    this._selectVertex.userData.vertexInfo = {
      points,
      index,
      mesh,
      vertexIndices,
      lines: lines ?? null,
      edgeVertexIndices,
    };
  }

  /** Центрует прокси-вершину на выбранной точке */
  private _centerVertexOnPoint(target: THREE.Points, points: THREE.Points, index: number) {
    const src = points.geometry.getAttribute('position') as THREE.BufferAttribute;

    // мировая позиция вершины
    const vWorld = new THREE.Vector3(
      src.getX(index),
      src.getY(index),
      src.getZ(index),
    ).applyMatrix4(points.matrixWorld);

    // позиция объекта
    target.position.copy(vWorld);

    const g = target.geometry as THREE.BufferGeometry;
    let dst = g.getAttribute('position') as THREE.BufferAttribute | null;
    if (!dst || dst.count < 1) {
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
      dst = g.getAttribute('position') as THREE.BufferAttribute;
    }
    dst.setXYZ(0, 0, 0, 0);
    dst.needsUpdate = true;

    target.quaternion.identity();
    target.scale.set(1, 1, 1);

    target.updateMatrixWorld(true);
  }
}
