// Core
import { Camera } from 'three';
// Extensions
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Interfaces
import type { Disposable } from 'tsyringe';

/**
 * Расширение для OrbitControls с отслеживанием управления камерой
 * @internal
 */
export class OrbitWithState extends OrbitControls implements Disposable {
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
  public dispose(): Promise<void> | void {
    this.domElement?.removeEventListener('mousedown', () => (this.isInteracting = true));
    this.domElement?.removeEventListener('mouseup', () => (this.isInteracting = false));
    this.domElement?.removeEventListener('touchstart', () => (this.isInteracting = true));
    this.domElement?.removeEventListener('touchend', () => (this.isInteracting = false));
  }
}
