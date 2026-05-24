// Types
import type { RendererConfig } from '@planara/types';

/**
 * Базовые настройки для рендерера
 *
 * @internal
 * @const
 */
export const defaultRendererConfig: RendererConfig = {
  background: {
    color: 0x1a1a1a,
    transparent: false,
  },

  camera: {
    fov: 45,
    near: 0.1,
    far: 1000,
    position: {
      x: 1,
      y: 1,
      z: 7,
    },
  },

  renderer: {
    antialias: true,
    alpha: false,
  },

  lights: {
    ambient: {
      enabled: true,
      color: 0xffffff,
      intensity: 0.5,
    },

    directional: {
      enabled: true,
      color: 0xffffff,
      intensity: 1,
      position: {
        x: 5,
        y: 10,
        z: 7,
      },
    },
  },
};
