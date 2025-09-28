import { Renderer as OGLRenderer, Camera, Transform, GridHelper, Orbit, AxesHelper } from 'ogl';

export class Renderer {
  public gl: OGLRenderer;
  public scene: Transform;
  public camera: Camera;
  public orbit: Orbit;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = new OGLRenderer({ canvas });
    this.gl.setSize(canvas.clientWidth, canvas.clientHeight);
    this.gl.gl.clearColor(1, 1, 1, 1);

    this.scene = new Transform();

    // Камера
    this.camera = new Camera(this.gl.gl, { fov: 45 });
    this.camera.position.set(1, 1, 7);
    this.camera.lookAt([0, 0, 0]);

    // Сетка
    const grid = new GridHelper(this.gl.gl, { size: 10, divisions: 10 });
    grid.position.y = -0.001;
    grid.setParent(this.scene);

    // Управление
    this.orbit = new Orbit(this.camera);

    // Оси X, Y, Z
    const axes = new AxesHelper(this.gl.gl, { size: 6, symmetric: true });
    axes.setParent(this.scene);
  }

  resize() {
    this.gl.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({ aspect: this.canvas.width / this.canvas.height });
  }

  render() {
    this.gl.render({ scene: this.scene, camera: this.camera });
  }

  loop() {
    this.orbit.update();
    this.render();
    requestAnimationFrame(this.loop.bind(this));
  }
}
