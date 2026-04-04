// Types
import type { ToolType } from '@planara/types';
// Interfaces
import type { ITransformApi } from '../../interfaces/api/transform-api';
import type { IToolHandler } from '../../interfaces/handler/tool-handler';
import type { IEditorStore } from '../../interfaces/store/editor-store';

/**
 * Базовый класс для инструментов
 * @internal
 */
export abstract class BaseToolHandler implements IToolHandler {
  public abstract readonly mode: ToolType;

  private readonly _unsubscribeTransform: () => void;

  protected constructor(
    protected api: ITransformApi,
    protected store: IEditorStore,
  ) {
    this._unsubscribeTransform = this.api.onTransformChange(() => {
      const selected = this.store.getSelectedObject();
      if (!selected) return;

      this.store.notifySelectedTransformChange?.();
    });
  }

  /**
   * Обновляет состояние инструмента под текущее выделение.
   */
  public handle(): void {
    // Получение текущего выбранного объекта
    const target = this.store.getSelectedObject();

    // Смена режима transform controls
    this.api.setTransformMode(this.mode);

    // Если есть объект, то добавляем transform controls
    if (target) this.api.attachTransform(target);
    // Иначе - скрываем хелперы
    else this.api.detachTransform();
  }

  /**
   * Откатывает локальное состояние инструмента при смене инструмента.
   *
   * Вызывается менеджером перед активацией другого хендлера.
   */
  public rollback(): void {
    this.api.detachTransform();
  }

  /** Освобождение ресурсов хендлера. */
  public dispose(): Promise<void> | void {
    this.rollback();

    if (this._unsubscribeTransform) {
      this._unsubscribeTransform();
    }
  }
}
