// Types
import type { ToolType } from '@planara/types';
// Interfaces
import type { ITransformHelpersApi } from '../../interfaces/api/transform-helpers-api';
import type { IToolHandler } from '../../interfaces/handler/tool-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';

/**
 * Базовый класс для инструментов
 * @internal
 */
export abstract class BaseToolHandler implements IToolHandler {
  public abstract readonly mode: ToolType;

  protected constructor(
    protected api: ITransformHelpersApi,
    protected store: IEditorStore,
  ) {}

  /**
   * Обновляет состояние инструмента под текущее выделение.
   */
  public handle(): void {
    // Получение текущего выбранного объекта
    const target = this.store.getSelectedObject();

    // Смена режима transform controls
    this.api.setMode(this.mode);

    // Если есть объект, то добавляем transform controls
    if (target) this.api.attach(target);
    // Иначе - скрываем хелперы
    else this.api.detach();
  }

  /**
   * Откатывает локальное состояние инструмента при смене инструмента.
   *
   * Вызывается менеджером перед активацией другого хендлера.
   */
  public rollback(): void {
    this.api.detach();
  }

  /** Освобождение ресурсов хендлера. */
  public dispose(): Promise<void> | void {
    this.rollback();
  }
}
