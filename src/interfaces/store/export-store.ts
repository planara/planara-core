// Types
import type { ExportResult } from '@planara/types';

/** @public */
export interface IExportStore {
  setResult(result: ExportResult): void;
  getResult(): ExportResult | null;
  clearResult(): void;
}
