// Core
import { Orbit } from 'ogl';

/**
 * Расширение для Orbit с отслеживанием управления камерой
 * @internal
 */
export class OrbitWithState extends Orbit {
  /** Используется ли Orbit-controls */
  public isInteracting: boolean = false;

  private readonly _element;

  constructor(object: any, options: any = {}) {
    super(object, options);

    this._element = options.element || document;

    // Добавление обработчиков событий
    this._element.addEventListener('mousedown', () => (this.isInteracting = true));
    this._element.addEventListener('mouseup', () => (this.isInteracting = false));
    this._element.addEventListener('touchstart', () => (this.isInteracting = true));
    this._element.addEventListener('touchend', () => (this.isInteracting = false));
  }

  /** Очистка новых обработчиков событий */
  public destroy() {
    this._element.removeEventListener('mousedown', () => (this.isInteracting = true));
    this._element.removeEventListener('mouseup', () => (this.isInteracting = false));
    this._element.removeEventListener('touchstart', () => (this.isInteracting = true));
    this._element.removeEventListener('touchend', () => (this.isInteracting = false));
  }
}
