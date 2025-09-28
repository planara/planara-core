import { Renderer } from './core/renderer';

const canvas = document.getElementById('app') as HTMLCanvasElement;
const renderer = new Renderer(canvas);
renderer.loop();
window.addEventListener('resize', renderer.resize, false);
renderer.resize();