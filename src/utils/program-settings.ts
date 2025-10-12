import { type OGLRenderingContext, Program } from 'ogl';

/**
 * Создает универсальный Program для рендерера.
 *
 * Включает базовый vertex и fragment шейдеры, добавляет uniform `tMap` с дефолтной текстурой.
 * Этот Program можно использовать для всех фигур в сцене, а также для сетки и осей.
 *
 * @param gl - WebGL контекст.
 * @returns Экземпляр Program с базовыми шейдерами и uniform.
 * @internal
 */
export function _createProgram(gl: OGLRenderingContext): Program {
  const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec3 normal;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;

    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;

    uniform float uHit;
    uniform float uSelected;

    varying vec3 vNormal;

    void main() {
      vec3 normal = normalize(vNormal);
      float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));

      // Базовый цвет меша
      vec3 baseColor = vec3(0.2, 0.8, 1.0);

      // Цвет при наведении (hover)
      vec3 hoverColor = vec3(1.0, 1.0, 0.1);

      // Цвет при клике (selected)
      vec3 selectedColor = vec3(1.0, 0.3, 0.3);

      // Применяем логику подсветки:
      // приоритет: выделение > hover > обычный цвет
      vec3 color = mix(baseColor, hoverColor, uHit);
      color = mix(color, selectedColor, uSelected);

      // Немного света для объема
      color += lighting * 0.1;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return new Program(gl, {
    vertex,
    fragment,
    cullFace: false,
    uniforms: {
      uHit: { value: 0 },
      uSelected: { value: 0 },
    },
  });
}
