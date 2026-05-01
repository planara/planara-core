// MobX
import { makeAutoObservable, observable } from 'mobx';
// Types
import type { ExportResult } from '@planara/types';
// Interfaces
import type { IExportStore } from '@/interfaces/store';

export class ExportStore implements IExportStore {
  private _result: ExportResult | null = null;

  public constructor() {
    makeAutoObservable<ExportStore, '_result'>(
      this,
      {
        _result: observable.ref,
      },
      {
        autoBind: true,
      },
    );
  }

  public get result(): ExportResult | null {
    return this._result;
  }

  public get hasResult(): boolean {
    return this._result !== null;
  }

  public setResult(result: ExportResult): void {
    this._result = result;
  }

  public getResult(): ExportResult | null {
    return this._result;
  }

  public clearResult(): void {
    this._result = null;
  }
}
