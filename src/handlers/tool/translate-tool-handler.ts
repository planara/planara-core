// Core
import { BaseToolHandler } from './base-tool-handler';
// Interfaces
import type { ITransformApi } from '../../interfaces/api/transform-api';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Types
import { ToolType } from '@planara/types';
// IOC
import { inject, injectable } from 'tsyringe';

/**
 * Хендлер инструмента «перемещение».
 *
 * Отвечает только за управление общими TransformControls через Renderer API:
 * - выставляет режим гизмо;
 * - прикрепляет к текущему объекту или отцепляет его.
 *
 * @internal
 * @extends BaseToolHandler
 */
@injectable()
export class TranslateToolHandler extends BaseToolHandler {
  /** Инструмент, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: ToolType = ToolType.Translate;

  public constructor(
    @inject('ITransformApi') api: ITransformApi,
    @inject('IEditorStore') store: IEditorStore,
  ) {
    super(api, store);
  }
}
