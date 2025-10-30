// Core
import * as THREE from 'three';
// IOC
import { inject, injectable } from 'tsyringe';
// Interfaces
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import type { IRaycastAPI } from '../../interfaces/api/raycast-api';
// Types
import { SelectMode } from '@planara/types';
// Events
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { SelectEventType } from '../../types/event/select-event-type';
// Constants
import { HOVER_COLOR, SELECT_COLOR } from '../../constants/colors';

/**
 * Хендлер для выборки граней (faces/triangles).
 * Управляет сценой через payload события рендерера.
 * Обрабатывает hover и click.
 * Меняет цвет грани конкретной модели из payload, в случае null возвращает исходное состояние.
 * @internal
 */
@injectable()
export class FaceSelectHandler implements ISelectHandler {
  /** Режим, которым управляет хендлер, нужен только менеджеру */
  public readonly mode: SelectMode = SelectMode.Face;

  /** Текущая наведённая грань */
  private _hovered: { mesh: THREE.Mesh; faceIndex: number } | null = null;
  /** Текущая выбранная грань */
  private _selected: { mesh: THREE.Mesh; faceIndex: number } | null = null;

  // Цвета, необходимые для переключения
  /** Цвет грани, на которую навелись */
  private readonly _hoverColor = HOVER_COLOR;
  /** Цвет выделенной граней */
  private readonly _selectColor = SELECT_COLOR;
  /** Изначальный цвет граней у модели, перед наложением эффектов*/
  private readonly _defaultColor = 0x222222;

  public constructor(@inject('RendererApi') private _api: IRaycastAPI) {}

  public handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    this._api.setRaycastMode(this.mode);
    if (type === SelectEventType.Hover) {
      console.log(payload);
    }

    if (type === SelectEventType.Click) {
      console.log(payload);
    }
  }

  public rollback(): void {
    throw new Error('Method not implemented.');
  }

  /** Освобождает ресурсы хендлера, удаляет слушатели и очищает внутренние данные. */
  public dispose(): Promise<void> | void {
    throw new Error('Method not implemented.');
  }
}
