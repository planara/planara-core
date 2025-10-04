import { type OGLRenderingContext, Program, Texture } from 'ogl';

/**
 * Создает универсальный Program для рендерера.
 *
 * Включает базовый vertex и fragment шейдеры, добавляет uniform `tMap` с дефолтной текстурой.
 * Этот Program можно использовать для всех фигур в сцене, а также для сетки и осей.
 *
 * @param {OGLRenderingContext} gl - WebGL контекст.
 * @returns {Program} Экземпляр Program с базовыми шейдерами и uniform.
 */
export function createProgram(gl: OGLRenderingContext): Program {
  const vertex = /* glsl */ `
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;

    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragment = /* glsl */ `
    precision highp float;

    uniform sampler2D tMap;
    varying vec3 vNormal;
    varying vec2 vUv;

    void main() {
      vec3 tex = texture2D(tMap, vUv).rgb;
      vec3 light = normalize(vec3(0.5, 1.0, -0.3));
      float shading = dot(normalize(vNormal), light) * 0.15;
      gl_FragColor.rgb = tex + shading;
      gl_FragColor.a = 1.0;
    }
  `;

  const defaultTexture = new Texture(gl);

  return new Program(gl, {
    vertex,
    fragment,
    uniforms: { tMap: { value: defaultTexture } },
  });
}
