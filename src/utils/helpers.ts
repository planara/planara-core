import * as THREE from 'three';

/** Является ли `THREE.Object3D` `THREE.Mesh` */
export const isMesh = (o: THREE.Object3D | null): o is THREE.Mesh => {
  return !!o && (o as any).isMesh;
};
