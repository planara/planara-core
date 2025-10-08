// Types
import { Figure, type FigureData, FigureType } from '@planara/types';

/** @public */
export class ObjLoader {
  /** Позиции вершин */
  private positions: number[] = [];

  /** Нормали вершин */
  private normals: number[] = [];

  /** UV-координаты (опционально) */
  private uvs: number[] = [];

  // Временные поля для парсинга файла
  private tmpPositions: number[][] = [];
  private tmpNormals: number[][] = [];
  private tmpUVs: number[][] = [];

  /**
   * Загружает OBJ-модель в Figure
   * @param objContent - Строка содержимого .obj файла
   */
  public load(objContent: string): Figure {
    const lines = objContent.split('\n');

    for (const line of lines) {
      if (!line.trim() || line.startsWith('#')) continue;

      const parts = line.trim().split(/\s+/);
      switch (parts[0]) {
        case 'v':
          this.tmpPositions.push(parts.slice(1).map(Number));
          break;
        case 'vn':
          this.tmpNormals.push(parts.slice(1).map(Number));
          break;
        case 'vt':
          this.tmpUVs.push(parts.slice(1).map(Number));
          break;
        case 'f':
          this.processFaceLine(parts);
          break;
        default:
          break;
      }
    }

    const figureData: FigureData = {
      type: FigureType.Custom,
      position: this.positions,
      ...(this.normals.length > 0 && { normal: this.normals }),
      ...(this.uvs.length > 0 && { uv: this.uvs }),
    };

    return new Figure(figureData);
  }

  /**
   * Обрабатывает строку face (f) и разворачивает индексы в массивы для рендеринга
   */
  private processFaceLine(parts: string[]) {
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      const [vIdxStr, vtIdxStr, vnIdxStr] = part.split('/');

      const vIdx = vIdxStr ? parseInt(vIdxStr, 10) : undefined;
      const vtIdx = vtIdxStr ? parseInt(vtIdxStr, 10) : undefined;
      const vnIdx = vnIdxStr ? parseInt(vnIdxStr, 10) : undefined;

      if (vIdx !== undefined) {
        const v = this.tmpPositions[vIdx - 1];
        if (v) this.positions.push(...v);
      }

      if (vtIdx !== undefined) {
        const uv = this.tmpUVs[vtIdx - 1];
        if (uv) this.uvs.push(...uv);
      }

      if (vnIdx !== undefined) {
        const n = this.tmpNormals[vnIdx - 1];
        if (n) this.normals.push(...n);
      }
    }
  }
}
