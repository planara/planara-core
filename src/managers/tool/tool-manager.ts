// Core
import * as THREE from 'three';
// IOC
import { inject, injectable, injectAll } from 'tsyringe';
// Interfaces
import type { IHandler } from '../../interfaces/handler/handler';
import type { IToolHandler } from '../../interfaces/handler/tool-handler';
import type { IToolManager } from '../../interfaces/manager/tool-manager';
// Events
import { EventTopics } from '../../events/event-topics';
// Types
import { ToolType } from '@planara/types';
import type { EventBus } from '../../events/event-bus';
import type { EditorEvents } from '../../events/editor-events';

@injectable()
export class ToolManager implements IToolManager {
  /** Текущий выбранный инструмент */
  private _currentTool: ToolType = ToolType.Translate;

  /** Хендлеры, которые управляют инструментами */
  private readonly _handlers: Map<ToolType, IHandler>;

  /** Объект, с которым взаимодействует инструмент */
  private _currentObject: THREE.Object3D | null;

  public constructor(
    @inject('EventBus') private _eventBus: EventBus,
    @injectAll('IToolHandler') handlers: IToolHandler[],
  ) {
    // Получение хендлеров
    this._handlers = new Map(handlers.map((h) => [h.mode, h]));

    // Инициализация объекта, с которым взаимодействует инструмент
    this._currentObject = null;

    // Подписка на событие выбора модели
    this._eventBus.on(EventTopics.ToolSelect, this._onSelect);
  }

  public manage(tool: ToolType): void {
    if (this._currentTool === tool) return;

    // Отключение предыдущего инструмента
    this._handlers.get(this._currentTool)?.rollback();

    // Использование нового инструмента
    this._handlers.get(tool)?.handle(this._currentObject);

    // Сохранение нового инструмента, для отката при выборе нового
    this._currentTool = tool;
  }

  private _onSelect = (payload: EditorEvents[EventTopics.ToolSelect]) => {
    if (this._currentObject === payload.mesh) return;

    // Получение хендлера под нужный режим
    const handler = this._handlers.get(this._currentTool);

    // Сохранение объекта, с которым взаимодействует инструмент
    this._currentObject = payload.mesh;

    if (payload.mesh === null) {
      handler?.rollback();
      return;
    }

    // Обработка события
    handler?.handle(this._currentObject);
  };

  public destroy(): void {
    // Очистка хендлеров
    if (this._handlers) {
      this._handlers.clear();
    }

    // Возвращение дефолтного значения
    this._currentTool = ToolType.Translate;
  }
}
