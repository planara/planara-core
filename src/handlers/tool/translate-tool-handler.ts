// Core
import { BaseToolHandler } from './base-tool-handler';
// Interfaces
import type { ITransformHelpersApi } from '../../interfaces/api/transform-helpers-api';
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

  public constructor(@inject('RendererApi') api: ITransformHelpersApi) {
    super(api);
  }
}
