import { Orbit } from 'ogl';

/** Расширение для Orbit с отслеживанием управления камерой*/
export class OrbitWithState extends Orbit {
  /** Используется ли Orbit-controls */
  public isInteracting: boolean = false;

  private readonly element;

  constructor(object: any, options: any = {}) {
    super(object, options);

    this.element = options.element || document;

    // Добавление обработчиков событий
    this.element.addEventListener('mousedown', () => (this.isInteracting = true));
    this.element.addEventListener('mouseup', () => (this.isInteracting = false));
    this.element.addEventListener('touchstart', () => (this.isInteracting = true));
    this.element.addEventListener('touchend', () => (this.isInteracting = false));
  }

  /** Очистка новых обработчиков событий */
  public destroy() {
    this.element.removeEventListener('mousedown', () => (this.isInteracting = true));
    this.element.removeEventListener('mouseup', () => (this.isInteracting = false));
    this.element.removeEventListener('touchstart', () => (this.isInteracting = true));
    this.element.removeEventListener('touchend', () => (this.isInteracting = false));
  }
}
