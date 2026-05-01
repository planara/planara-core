// Core
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';
// Interfaces
import type { ISceneHandler } from '@/interfaces/handler';
import type { ISceneApi } from '@/interfaces/api';
import type { IExportStore } from '@/interfaces/store';
// Types
import { SceneMode } from '@planara/types';
// IOC
import { inject, injectable } from 'tsyringe';
// Helpers
import { createObjExportRoot } from '@/utils';

/**
 * Хендлер для экспорта сцены в виде файла.
 *
 * @internal
 * @class
 */
@injectable()
export class ExportSceneHandler implements ISceneHandler {
  /** Режим редактирования сцены */
  public readonly mode: SceneMode = SceneMode.Export;

  public constructor(
    @inject('ISceneApi') private _api: ISceneApi,
    @inject('ExportStore') private readonly _exportStore: IExportStore,
  ) {}

  /** Экспорт всей сцены в ExportStore для последующей загрузки в виде файла. */
  public handle(): void {
    const scene = this._api.getScene();

    const exportRoot = createObjExportRoot(scene);

    const exporter = new OBJExporter();
    const content = exporter.parse(exportRoot);

    const createdAt = Date.now();

    this._exportStore.setResult({
      format: 'obj',
      filename: `scene-${createdAt}.obj`,
      mimeType: 'text/plain;charset=utf-8',
      content,
      createdAt,
    });
  }

  public rollback(): void {}

  /** Освобождает ресурсы хендлера. */
  public dispose(): Promise<void> | void {
    this._exportStore.clearResult();
  }
}
