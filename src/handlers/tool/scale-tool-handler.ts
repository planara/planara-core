// Core
import { BaseToolHandler } from './base-tool-handler';
// Interfaces
import type { ITransformHelpersApi } from '../../interfaces/api/transform-helpers-api';
import type { IEditorStore } from '../../interfaces/store/editor-store';
// Types
import { ToolType } from '@planara/types';
// IOC
import { inject, injectable } from 'tsyringe';

/**
 * Хендлер инструмента «масштабирование».
 *
 * Отвечает только за управление общими TransformControls через Renderer API:
 * - выставляет режим гизмо;
 * - прикрепляет к текущему объекту или отцепляет его.
 *
 * @internal
 * @extends BaseToolHandler
 */
@injectable()
export class ScaleToolHandler extends BaseToolHandler {
  /** Инструмент, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: ToolType = ToolType.Scale;

  public constructor(
    @inject('RendererApi') api: ITransformHelpersApi,
    @inject('IEditorStore') store: IEditorStore,
  ) {
    super(api, store);
  }
}
