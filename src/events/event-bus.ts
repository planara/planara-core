// Core
import { EventEmitter } from 'events';
// IOC
import { injectable } from 'tsyringe';
// Events
import type { EditorEvents } from './editor-events';

/**
 * Событийная шина редактора с топиками.
 * Используется для publish/subscribe без прямых зависимостей.
 * @public
 */
@injectable()
export class EventBus {
  private _emitter!: EventEmitter;

  constructor() {
    this._emitter = new EventEmitter();
  }

  /** Публикация события */
  emit<K extends keyof EditorEvents>(event: K, payload: EditorEvents[K]): void {
    this._emitter.emit(event, payload);
  }

  /** Подписка на событие */
  on<K extends keyof EditorEvents>(event: K, listener: (payload: EditorEvents[K]) => void): void {
    this._emitter.on(event, listener);
  }

  /** Отписка от события */
  off<K extends keyof EditorEvents>(event: K, listener: (payload: EditorEvents[K]) => void): void {
    this._emitter.off(event, listener);
  }
}
