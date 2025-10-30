import * as THREE from 'three';

export type SelectedListener = (obj: THREE.Object3D | null) => void;
