// Core
import * as THREE from 'three';
// Constants
import { EDGES_DEFAULT_COLOR, VERTEX_DEFAULT_COLOR } from '../constants/colors';
import { LINE_LAYER, POINT_LAYER } from '../constants/layers';

/** Является ли `THREE.Object3D` `THREE.Mesh` */
export const isMesh = (o: THREE.Object3D | null): o is THREE.Mesh => {
  return !!o && (o as any).isMesh;
};

/** Поиск родителя ребер (сама фигура) */
export const findParentMesh = (obj: THREE.Object3D | null): THREE.Mesh | null => {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if ((cur as any).isMesh) return cur as THREE.Mesh;
    cur = cur.parent;
  }
  return null;
};

/** Создание вершин */
export const makeVertexPoints = (geom: THREE.BufferGeometry) => {
  const pointsGeom = new THREE.BufferGeometry();
  pointsGeom.setAttribute('position', geom.getAttribute('position'));

  pointsGeom.computeBoundingSphere();
  pointsGeom.computeBoundingBox();

  const mat = new THREE.PointsMaterial({
    color: VERTEX_DEFAULT_COLOR,
    size: 6,
    sizeAttenuation: false,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
  });

  const pts = new THREE.Points(pointsGeom, mat);
  pts.layers.set(POINT_LAYER);
  pts.renderOrder = 1000;

  pts.visible = false;

  return pts;
};

/** Создание внешних граней */
export const makeLineSegments = (geometry: THREE.BufferGeometry) => {
  // внешние рёбра
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: EDGES_DEFAULT_COLOR, linewidth: 1 }),
  );
  line.layers.set(LINE_LAYER);

  return line;
};
