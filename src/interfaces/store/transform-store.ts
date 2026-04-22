// Interfaces
import type { ISelectStore } from './select-store';
import type { IToolStore } from './tool-store';

/**
 * Обобщенный интерфейс для хендлеров инструментов (`IToolHandler`).
 *
 * @public
 * @interface
 */
export interface ITransformStore extends ISelectStore, IToolStore {}
