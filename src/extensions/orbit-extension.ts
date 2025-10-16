// Core
import { Camera } from 'three';
// Extensions
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * Расширение для OrbitControls с отслеживанием управления камерой
 * @internal
 */
export class OrbitWithState extends OrbitControls {
  /** Используется ли Orbit-controls */
  public isInteracting: boolean = false;

  constructor(camera: Camera, domElement?: HTMLElement | null) {
    super(camera, domElement);

    // Добавление обработчиков событий
    this.domElement?.addEventListener('mousedown', () => (this.isInteracting = true));
    this.domElement?.addEventListener('mouseup', () => (this.isInteracting = false));
    this.domElement?.addEventListener('touchstart', () => (this.isInteracting = true));
    this.domElement?.addEventListener('touchend', () => (this.isInteracting = false));
  }

  /** Очистка новых обработчиков событий */
  public destroy() {
    this.domElement?.removeEventListener('mousedown', () => (this.isInteracting = true));
    this.domElement?.removeEventListener('mouseup', () => (this.isInteracting = false));
    this.domElement?.removeEventListener('touchstart', () => (this.isInteracting = true));
    this.domElement?.removeEventListener('touchend', () => (this.isInteracting = false));
  }
}
