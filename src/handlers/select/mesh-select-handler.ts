import { inject, injectable } from 'tsyringe';
import type { ISelectHandler } from '../../interfaces/handler/select-handler';
import { SelectMode } from '@planara/types';
import type { Program } from 'ogl';
import type { RendererApi } from '../../utils/renderer-api';
import type { EditorEvents } from '../../events/editor-events';
import { EventTopics } from '../../events/event-topics';
import { EditorMesh } from '../../extensions/mesh-extension';
import { SelectEventType } from '../../types/event/select-event-type';

@injectable()
export class MeshSelectHandler implements ISelectHandler {
  /** Режим выборки */
  public readonly mode: SelectMode = SelectMode.Mesh;

  /** Текущая программа для рендеринга фигуры*/
  private readonly _program: Program;

  /** Выбранная фигура */
  private _selectedMesh: EditorMesh | null;

  constructor(@inject('RendererApi') private _api: RendererApi) {
    // Получение программы рендеринга
    this._program = _api.getProgram();

    // Инициализация выбранной фигуры
    this._selectedMesh = null;
  }

  handle(
    payload: EditorEvents[EventTopics.SelectHover] | EditorEvents[EventTopics.SelectClick],
    type: SelectEventType,
  ): void {
    if (!payload) return;

    // Получение фигуры из события
    const { mesh } = payload;

    if (type === SelectEventType.Hover) {
      // Добавление обработчика на модель
      this._api.setMeshBeforeRender(mesh, () => this._onHover(mesh as EditorMesh));
    } else {
      this._api.setMeshBeforeRender(mesh, () => this._onClick(mesh as EditorMesh));
    }
  }

  /** Обработчик события при наведении курсора мыши на модель */
  private _onHover = (mesh: EditorMesh) => {
    mesh.program.uniforms.uHit.value = mesh.isHit ? 1 : 0;
  };

  /** Обработчик события при клике на модель */
  private _onClick = (mesh: EditorMesh) => {
    // Снимаем выделение с предыдущего
    if (this._selectedMesh && this._selectedMesh.program?.uniforms.uSelected) {
      this._selectedMesh.program.uniforms.uSelected.value = 0;
    }

    // Устанавливаем новое выделение
    this._selectedMesh = mesh;
    if (mesh.program?.uniforms.uSelected) {
      mesh.program.uniforms.uSelected.value = 1;
    }

    console.log(`Selected mesh: ${mesh.id}`);
  }

  /** Выключение подсветки у моделей */
  rollback(): void {
    this._program.uniforms.uHit.value = 0;
  }

  destroy(): void {
    this.rollback();
  }
}
