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

  /** @inheritdoc */
  public getSelectMode(): SelectMode {
    return this._selectMode;
  }

  /** @inheritdoc */
  public getToolType(): ToolType {
    return this._toolType;
  }

  /** @inheritdoc */
  public getDisplayMode(): DisplayMode {
    return this._displayMode;
  }

  /** @inheritdoc */
  public setSelectMode(mode: SelectMode): void {
    this._selectMode = mode;
  }

  /** @inheritdoc */
  public setToolType(toolType: ToolType): void {
    this._toolType = toolType;
  }

  /** @inheritdoc */
  public setDisplayMode(mode: DisplayMode): void {
    this._displayMode = mode;
  }

  /** @inheritdoc */
  public getSelectedObject(): THREE.Object3D | null {
    return this._selectedObject;
  }

  /** @inheritdoc */
  public getSelectionStats(): FigureTransform | null {
    const obj = this._selectedObject;
    if (!obj) return null;

    return toFigureTransform(obj);
  }

  /** @inheritdoc */
  public setSelectedObject(object: THREE.Object3D | null): void {
    if (this._selectedObject === object) return;
    this._selectedObject = object;

    // Уведомление подписчиков об изменении выбранного объекта.
    for (const cb of this._selectedListeners) cb(this._selectedObject);
  }

  /** @inheritdoc */
  public onSelectedObjectChange(cb: SelectedListener): () => void {
    this._selectedListeners.add(cb);
    return () => this._selectedListeners.delete(cb);
  }

  /** @inheritdoc */
  public onSelectedTransformChange(cb: TransformListener): () => void {
    this._transformListeners.add(cb);
    return () => this._transformListeners.delete(cb);
  }

  /** @inheritdoc */
  public notifySelectedTransformChange(): void {
    for (const cb of this._transformListeners) cb();
  }
}
