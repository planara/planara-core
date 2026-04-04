// Core
import * as THREE from 'three';
// Interfaces
import type { IEditorStore } from '../interfaces/store/editor-store';
// IOC
import { injectable } from 'tsyringe';
// Store
import { makeAutoObservable } from 'mobx';
// Types
import { DisplayMode, type FigureTransform, SelectMode, ToolType } from '@planara/types';
import type { SelectedListener } from '../types/listener/selected-listener';
import type { TransformListener } from '../types/listener/transform-listener';
// Helpers
import { toFigureTransform } from '../utils/helpers';

/** Store для всего редактора. */
@injectable()
export class EditorStore implements IEditorStore {
  /** Текущий режим выборки. */
  private _selectMode: SelectMode = SelectMode.Mesh;

  /** Текущий выбранный инструмент. */
  private _toolType: ToolType = ToolType.Translate;

  /** Выбранный режим отображения. */
  private _displayMode: DisplayMode = DisplayMode.Plane;

  /** Выбранный объект на сцене. */
  private _selectedObject: THREE.Object3D | null = null;

  /** Слушатели событий по изменению выбранного объекта. */
  private _selectedListeners = new Set<SelectedListener>();

  /** Слушатели событий трансформации выбранного объекта. */
  private _transformListeners = new Set<TransformListener>();

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public getSelectMode(): SelectMode {
    return this._selectMode;
  }

  public getToolType(): ToolType {
    return this._toolType;
  }

  public getDisplayMode(): DisplayMode {
    return this._displayMode;
  }

  public setSelectMode(mode: SelectMode): void {
    this._selectMode = mode;
  }

  public setToolType(toolType: ToolType): void {
    this._toolType = toolType;
  }

  public setDisplayMode(mode: DisplayMode): void {
    this._displayMode = mode;
  }

  public getSelectedObject(): THREE.Object3D | null {
    return this._selectedObject;
  }

  public getSelectionStats(): FigureTransform | null {
    const obj = this._selectedObject;
    if (!obj) return null;

    return toFigureTransform(obj);
  }

  public setSelectedObject(object: THREE.Object3D | null): void {
    if (this._selectedObject === object) return;
    this._selectedObject = object;

    // Уведомление подписчиков об изменении выбранного объекта.
    for (const cb of this._selectedListeners) cb(this._selectedObject);
  }

  public onSelectedObjectChange(cb: SelectedListener): () => void {
    this._selectedListeners.add(cb);
    return () => this._selectedListeners.delete(cb);
  }

  public onSelectedTransformChange(cb: TransformListener): () => void {
    this._transformListeners.add(cb);
    return () => this._transformListeners.delete(cb);
  }

  public notifySelectedTransformChange(): void {
    for (const cb of this._transformListeners) cb();
  }
}
