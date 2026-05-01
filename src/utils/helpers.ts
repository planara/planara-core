// Core
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// Constants
import {
  EDGES_DEFAULT_COLOR,
  VERTEX_DEFAULT_COLOR,
  LINE_LAYER,
  POINT_LAYER,
  BASE_MATERIAL,
  MESH_LAYER,
} from '@/constants';
// Types
import type { FigureTransform, RendererConfig, RendererConfigInput, Vec3 } from '@planara/types';

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

/** Сбор статистики объекта */
export const toFigureTransform = (obj: THREE.Object3D): FigureTransform => {
  // Сбор статистики
  const position: Vec3 = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
  const rotation: Vec3 = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
  const scale: Vec3 = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };

  // Получение габаритов модели
  const bbox = new THREE.Box3().setFromObject(obj);
  const sizeVec = new THREE.Vector3();
  bbox.getSize(sizeVec);

  const size: Vec3 = { x: sizeVec.x, y: sizeVec.y, z: sizeVec.z };

  return { position, rotation, scale, size };
};

/** Создание конфига для рендерера, при использовании частичного пользовательского конфига */
export const mergeRendererConfig = (
  base: RendererConfig,
  input?: RendererConfigInput,
): RendererConfig => {
  if (!input) {
    return base;
  }

  return {
    background: {
      ...base.background,
      ...input.background,
    },

    camera: {
      ...base.camera,
      ...input.camera,
      position: {
        ...base.camera.position,
        ...input.camera?.position,
      },
    },

    renderer: {
      ...base.renderer,
      ...input.renderer,
    },

    lights: {
      ambient: {
        ...base.lights.ambient,
        ...input.lights?.ambient,
      },

      directional: {
        ...base.lights.directional,
        ...input.lights?.directional,
        position: {
          ...base.lights.directional.position,
          ...input.lights?.directional?.position,
        },
      },
    },
  };
};

/** Пометить объект как прокси */
export const markAsProxyObject = <T extends THREE.Object3D>(object: T): T => {
  object.userData.isProxy = true;
  object.userData.isExportable = false;

  return object;
};

/** Пометить объект как не экспортируемый */
export const markAsNotExportable = <T extends THREE.Object3D>(object: T): T => {
  object.userData.isExportable = false;

  return object;
};

/** Является ли объект прокси */
export const isProxyObject = (object: THREE.Object3D): boolean => {
  return object.userData.isProxy === true;
};

export const hasNotExportableObjectInTree = (object: THREE.Object3D): boolean => {
  let current: THREE.Object3D | null = object;

  while (current) {
    if (current.userData.isExportable === false) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

/** Можно ли экспортировать объект как часть OBJ-сцены */
export const isObjExportableObject = (object: THREE.Object3D): object is THREE.Mesh => {
  if (!isMesh(object)) {
    return false;
  }

  if (!object.visible) {
    return false;
  }

  if (isProxyObject(object)) {
    return false;
  }

  if (hasNotExportableObjectInTree(object)) {
    return false;
  }

  return object.userData.isExportable !== false;
};

export const createObjExportRoot = (scene: THREE.Scene): THREE.Group => {
  const root = new THREE.Group();
  root.name = 'Planara_OBJ_Export';

  scene.updateMatrixWorld(true);

  scene.traverse((object) => {
    if (!isObjExportableObject(object)) {
      return;
    }

    const mesh = object.clone(false);

    mesh.geometry = object.geometry.clone();

    if (Array.isArray(object.material)) {
      mesh.material = object.material.map((material) => material.clone());
    } else {
      mesh.material = object.material.clone();
    }

    mesh.matrix.copy(object.matrixWorld);
    mesh.matrixAutoUpdate = false;

    root.add(mesh);
  });

  return root;
};

export const createMeshesFromObjContent = (content: string): THREE.Mesh[] => {
  const loader = new OBJLoader();
  const object = loader.parse(content);

  object.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];

  object.traverse((child) => {
    if (!isMesh(child)) {
      return;
    }

    const geometry = child.geometry.clone();

    geometry.applyMatrix4(child.matrixWorld);

    geometry.computeBoundingBox();

    const box = geometry.boundingBox;

    if (!box) {
      return;
    }

    const center = new THREE.Vector3();
    box.getCenter(center);

    geometry.translate(-center.x, -center.y, -center.z);

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();

    const position = geometry.getAttribute('position');

    if (position && (position as any).setUsage) {
      (position as any).setUsage(THREE.DynamicDrawUsage);
    }

    const mesh = new THREE.Mesh(geometry, BASE_MATERIAL.clone());

    mesh.position.copy(center);

    mesh.layers.enable(MESH_LAYER);

    const renderGeometry = geometry.index ? geometry.toNonIndexed() : geometry;

    const line = markAsNotExportable(makeLineSegments(renderGeometry));
    line.layers.enable(MESH_LAYER);
    mesh.add(line);

    const points = markAsNotExportable(makeVertexPoints(renderGeometry));
    points.layers.enable(MESH_LAYER);
    mesh.add(points);

    meshes.push(mesh);
  });

  return meshes;
};
