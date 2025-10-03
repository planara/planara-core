import { Renderer as OGLRenderer, Camera, Transform } from 'ogl';

export abstract class Renderer {
    public gl: OGLRenderer;
    public scene: Transform;
    public camera: Camera;
    protected canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = new OGLRenderer({ canvas });
        this.gl.setSize(canvas.clientWidth, canvas.clientHeight);
        this.gl.gl.clearColor(1, 1, 1, 1);

        this.scene = new Transform();

        this.camera = new Camera(this.gl.gl, { fov: 45 });
        this.camera.position.set(1, 1, 7);
        this.camera.lookAt([0, 0, 0]);

        this.init();
    }

    protected abstract init(): void;

    resize() {
        this.gl.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.camera.perspective({ aspect: this.canvas.width / this.canvas.height });
    }

    render() {
        this.gl.render({ scene: this.scene, camera: this.camera });
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    protected update(): void {}
}
