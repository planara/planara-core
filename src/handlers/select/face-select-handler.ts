// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';
import type { IEditorApi } from '../../types/api/editor-api';
// Types
import { SelectMode } from '@planara/types';
import type { FaceGroup } from '../../types/select/face-group';
// Events
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { SelectEventType } from '../../types/event/select-event-type';
// Constants
import { HOVER_COLOR, SELECT_COLOR } from '../../constants/colors';
import { OVERLAY_LAYER } from '../../constants/layers';

/*
 * =========================================================================================
 *
 * Hover по Face может не обновляться при перемещении курсора внутри одного и того же Mesh,
 * так как raycast для hover-событий сравнивает только intersection.object.
 *
 * Для Face режима сравнение должно учитывать:
 * - object
 * - faceIndex
 *
 * Текущая реализация оставлена как есть намеренно.
 * Это ограничение относится к слою raycast-событий, а не к логике FaceSelectHandler.
 *
 * =========================================================================================
 *
 * Сама идея схожа с поведением vertex/edge selection, взять прокси объекты и копировать геометрию модели на прокси
 * Для граней используется массив треугольников, который после нахождения треугольников грани у модели группируется в отдельный Mesh
 * Таким образом, можно получать "слепок" грани любой фигуры(геометрии) независимо от количества точек и ребер.
 */

/**
 * Хендлер для выборки граней (faces/triangles).
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет грани конкретной модели из payload, в случае null возвращает исходное состояние.
 * @internal
 */
@injectable()
export class FaceSelectHandler implements ISelectHandler {
  /** Режим, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: SelectMode = SelectMode.Face;

  /** Текущая наведённая грань */
  private readonly _hoverFace: THREE.Mesh;
  /** Текущая выбранная грань */
  private readonly _selectFace: THREE.Mesh;

  // Группы треугольников, которые образуют грань
  //
  // !!NB:
  // Все грани фигур состоят из треугольников, их объединение даст необходимую грань
  /** Текущая группа треугольников для наведённой грани */
  private _hovered: FaceGroup | null = null;
  /** Текущая группа треугольников для выбранной грани */
  private _selected: FaceGroup | null = null;

  // Цвета, необходимые для переключения
  /** Цвет грани, на которую навелись */
  private readonly _hoverColor = HOVER_COLOR;
  /** Цвет выделенной граней */
  private readonly _selectColor = SELECT_COLOR;

  // Погрешности для поиска треугольников и сборки граней
  /** Погрешность на сравнение нормалей */
  private readonly _normalEps = 1e-4;
  /** Погрешность на принадлежность одной плоскости */
  private readonly _planeEps = 1e-4;

  public constructor(
    @inject('RendererApi') private _api: IEditorApi,
    @inject('IEditorStore') private _store: IEditorStore,
  ) {
    // Устанавливаем слой отображения граней для камеры
    this._api.enableCameraLayer(OVERLAY_LAYER);

    // Создание граней для добавления на сцену
    this._hoverFace = this._makeOverlayFace(this._hoverColor);
    this._selectFace = this._makeOverlayFace(this._selectColor);

    // Добавление граней на сцену
    this._api.addObject(this._hoverFace, OVERLAY_LAYER);
    this._api.addObject(this._selectFace, OVERLAY_LAYER);
  }

  /** Обработка текущего режима выборки. */
  public handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    this._api.setRaycastMode(this.mode);

    // Обработка hover-события
    if (type === SelectEventType.Hover) {
      if (!payload) {
        this._hoverFace.visible = false;
        this._hovered = null;

        return;
      }

      // Проверка на входящее пересечение
      const obj = payload.intersection.object as any;
      if (!obj?.isMesh) return;

      const mesh = obj as THREE.Mesh;
      const faceIndex = payload.intersection.faceIndex ?? -1;
      if (faceIndex < 0) return;

      const group = this._collectFaceGroup(mesh, faceIndex);
      if (!group) return;

      if (this._selected && this._same(group, this._selected)) {
        this._hoverFace.visible = false;
      } else {
        this._writeWorldFaceGroup(this._hoverFace, group);
        this._hoverFace.visible = true;
      }

      this._hovered = group;

      return;
    }

    // Обработка click-события
    if (type === SelectEventType.Click) {
      if (!payload) {
        this._selectFace.visible = false;
        this._selected = null;
        this._store.setSelectedObject(null);

        return;
      }

      // Проверка на входящее пересечение
      const obj = payload.intersection.object as any;
      if (!obj?.isMesh) return;

      const mesh = obj as THREE.Mesh;
      const faceIndex = payload.intersection.faceIndex ?? -1;
      if (faceIndex < 0) return;

      const group = this._collectFaceGroup(mesh, faceIndex);
      if (!group) return;

      this._writeWorldFaceGroup(this._selectFace, group);
      this._selectFace.visible = true;

      // Подготовка метаданных для инструментов
      this._prepareFaceMetadata(group);

      // Сохранение выбранного объекта в store
      this._store.setSelectedObject(this._selectFace);
      this._selected = group;

      if (this._hovered && this._same(this._hovered, this._selected)) {
        this._hoverFace.visible = false;
      }
    }
  }

  /** Откат текущего режима выборки */
  public rollback(): void {
    this._hoverFace.visible = false;
    this._selectFace.visible = false;

    this._hovered = this._selected = null;
  }

  /** Освобождает ресурсы хендлера, удаляет слушатели и очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    this.rollback();

    this._api.removeObject(this._hoverFace);
    this._api.removeObject(this._selectFace);

    this._hoverFace.geometry.dispose();
    (this._hoverFace.material as THREE.Material).dispose();

    this._selectFace.geometry.dispose();
    (this._selectFace.material as THREE.Material).dispose();
  }

  /**
   * Инициализация overlay mesh для режима (hover и click).
   * На весь режим используются 2 глобальных mesh на сцене,
   * геометрия которых переписывается под текущую грань.
   */
  private _makeOverlayFace(color: number): THREE.Mesh {
    const g = new THREE.BufferGeometry();

    const m = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const mesh = new THREE.Mesh(g, m);
    mesh.renderOrder = 1000;
    mesh.layers.set(OVERLAY_LAYER);
    mesh.visible = false;

    // Не мешаем raycast
    (mesh as any).raycast = () => {};

    return mesh;
  }

  /**
   * Сбор логической грани как связной группы компланарных треугольников.
   * Если geometry неиндексированная — пока возвращаем только стартовый triangle.
   */
  private _collectFaceGroup(mesh: THREE.Mesh, startFaceIndex: number): FaceGroup | null {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute | undefined;

    if (!pos) return null;

    const index = geometry.index;

    // Fallback для non-indexed geometry
    if (!index) {
      return {
        mesh,
        faceIndex: startFaceIndex,
        triangleIndices: [startFaceIndex],
      };
    }

    const triCount = Math.floor(index.count / 3);
    if (startFaceIndex < 0 || startFaceIndex >= triCount) return null;

    const adjacency = this._buildTriangleAdjacency(index, pos);

    const [bi0, bi1, bi2] = this._getTriangleIndices(index, startFaceIndex);
    const a0 = this._readVertex(pos, bi0);
    const b0 = this._readVertex(pos, bi1);
    const c0 = this._readVertex(pos, bi2);

    const baseNormal = new THREE.Vector3()
      .subVectors(b0, a0)
      .cross(new THREE.Vector3().subVectors(c0, a0))
      .normalize();

    const basePlane = new THREE.Plane().setFromNormalAndCoplanarPoint(baseNormal, a0);

    const visited = new Set<number>();
    const result: number[] = [];
    const stack: number[] = [startFaceIndex];

    while (stack.length > 0) {
      const triIndex = stack.pop()!;
      if (visited.has(triIndex)) continue;
      visited.add(triIndex);

      const [i0, i1, i2] = this._getTriangleIndices(index, triIndex);
      const a = this._readVertex(pos, i0);
      const b = this._readVertex(pos, i1);
      const c = this._readVertex(pos, i2);

      const triNormal = new THREE.Vector3()
        .subVectors(b, a)
        .cross(new THREE.Vector3().subVectors(c, a))
        .normalize();

      const sameNormal = Math.abs(triNormal.dot(baseNormal)) >= 1 - this._normalEps;
      const samePlane =
        Math.abs(basePlane.distanceToPoint(a)) < this._planeEps &&
        Math.abs(basePlane.distanceToPoint(b)) < this._planeEps &&
        Math.abs(basePlane.distanceToPoint(c)) < this._planeEps;

      if (!sameNormal || !samePlane) continue;

      result.push(triIndex);

      const neighbors = adjacency.get(triIndex);
      if (!neighbors) continue;

      for (const next of neighbors) {
        if (!visited.has(next)) stack.push(next);
      }
    }

    result.sort((x, y) => x - y);

    return {
      mesh,
      faceIndex: startFaceIndex,
      triangleIndices: result,
    };
  }

  /** Перезаписывает overlay mesh world-space треугольниками выбранной грани */
  private _writeWorldFaceGroup(target: THREE.Mesh, group: FaceGroup): void {
    const srcGeometry = group.mesh.geometry as THREE.BufferGeometry;
    const srcPos = srcGeometry.getAttribute('position') as THREE.BufferAttribute;
    const srcIndex = srcGeometry.index;

    const out = new Float32Array(group.triangleIndices.length * 9);
    let offset = 0;

    for (const triIndex of group.triangleIndices) {
      let i0: number;
      let i1: number;
      let i2: number;

      if (srcIndex) {
        [i0, i1, i2] = this._getTriangleIndices(srcIndex, triIndex);
      } else {
        i0 = triIndex * 3;
        i1 = triIndex * 3 + 1;
        i2 = triIndex * 3 + 2;
      }

      const a = this._readVertex(srcPos, i0).applyMatrix4(group.mesh.matrixWorld);
      const b = this._readVertex(srcPos, i1).applyMatrix4(group.mesh.matrixWorld);
      const c = this._readVertex(srcPos, i2).applyMatrix4(group.mesh.matrixWorld);

      out[offset++] = a.x;
      out[offset++] = a.y;
      out[offset++] = a.z;

      out[offset++] = b.x;
      out[offset++] = b.y;
      out[offset++] = b.z;

      out[offset++] = c.x;
      out[offset++] = c.y;
      out[offset++] = c.z;
    }

    const dstGeometry = target.geometry as THREE.BufferGeometry;
    dstGeometry.setAttribute('position', new THREE.BufferAttribute(out, 3));
    dstGeometry.setIndex(null);
    dstGeometry.computeVertexNormals();
    dstGeometry.computeBoundingBox();
    dstGeometry.computeBoundingSphere();
  }

  /** Сравнение двух логических граней */
  private _same(a: FaceGroup | null, b: FaceGroup | null): boolean {
    return (
      !!a &&
      !!b &&
      a.mesh === b.mesh &&
      a.triangleIndices.length === b.triangleIndices.length &&
      a.triangleIndices.every((value, index) => value === b.triangleIndices[index])
    );
  }

  /** Подготовка метаданных выбранной грани для инструментов */
  private _prepareFaceMetadata(group: FaceGroup): void {
    this._selectFace.userData.faceInfo = {
      mesh: group.mesh,
      faceIndex: group.faceIndex,
      triangleIndices: group.triangleIndices,
    };
  }

  /** Регистрирует ребро треугольника в edge map */
  private _pushEdge(map: Map<string, number[]>, a: number, b: number, tri: number): void {
    const key = a < b ? `${a}_${b}` : `${b}_${a}`;
    const arr = map.get(key);

    if (arr) arr.push(tri);
    else map.set(key, [tri]);
  }

  /** Строит граф соседства треугольников по общим ребрам */
  private _buildTriangleAdjacency(
    index: THREE.BufferAttribute,
    pos: THREE.BufferAttribute,
  ): Map<number, number[]> {
    const triCount = Math.floor(index.count / 3);
    const edgeMap = new Map<string, number[]>();

    const weldedMap = this._buildWeldMap(index, pos);

    for (let tri = 0; tri < triCount; tri++) {
      const [aRaw, bRaw, cRaw] = this._getTriangleIndices(index, tri);

      const a = weldedMap.get(aRaw)!;
      const b = weldedMap.get(bRaw)!;
      const c = weldedMap.get(cRaw)!;

      this._pushEdge(edgeMap, a, b, tri);
      this._pushEdge(edgeMap, b, c, tri);
      this._pushEdge(edgeMap, c, a, tri);
    }

    const adjacency = new Map<number, Set<number>>();
    for (let tri = 0; tri < triCount; tri++) {
      adjacency.set(tri, new Set<number>());
    }

    for (const tris of edgeMap.values()) {
      if (tris.length < 2) continue;

      for (let i = 0; i < tris.length; i++) {
        for (let j = 0; j < tris.length; j++) {
          if (i === j) continue;
          adjacency.get(tris[i]!)?.add(tris[j]!);
        }
      }
    }

    const result = new Map<number, number[]>();
    for (const [tri, set] of adjacency) {
      result.set(tri, Array.from(set));
    }

    return result;
  }

  /** Возвращает индексы трех вершин треугольника */
  private _getTriangleIndices(
    index: THREE.BufferAttribute,
    triIndex: number,
  ): [number, number, number] {
    return [index.getX(triIndex * 3), index.getX(triIndex * 3 + 1), index.getX(triIndex * 3 + 2)];
  }

  /** Читает вершину из position buffer в local space geometry */
  private _readVertex(pos: THREE.BufferAttribute, index: number): THREE.Vector3 {
    return new THREE.Vector3(pos.getX(index), pos.getY(index), pos.getZ(index));
  }

  /** Построение ключа вершины по позиции */
  private _vertexKey(pos: THREE.BufferAttribute, index: number, eps = 1e-6): string {
    const x = Math.round(pos.getX(index) / eps);
    const y = Math.round(pos.getY(index) / eps);
    const z = Math.round(pos.getZ(index) / eps);
    return `${x}_${y}_${z}`;
  }

  /**
   * Строит отображение исходных индексов вершин в "сваренные" ids по координате.
   * Нужно для случаев, когда соседние треугольники визуально делят ребро,
   * но используют разные индексы вершин (например, цилиндрические крышки, UV seams и т.п.).
   */
  private _buildWeldMap(
    index: THREE.BufferAttribute,
    pos: THREE.BufferAttribute,
  ): Map<number, number> {
    const keyToWelded = new Map<string, number>();
    const indexToWelded = new Map<number, number>();
    let nextId = 0;

    for (let i = 0; i < index.count; i++) {
      const originalIndex = index.getX(i);
      if (indexToWelded.has(originalIndex)) continue;

      const key = this._vertexKey(pos, originalIndex);
      let weldedId = keyToWelded.get(key);

      if (weldedId == null) {
        weldedId = nextId++;
        keyToWelded.set(key, weldedId);
      }

      indexToWelded.set(originalIndex, weldedId);
    }

    return indexToWelded;
  }
}
