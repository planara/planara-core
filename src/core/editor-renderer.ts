import { Renderer } from './renderer';
import { GridHelper, Orbit, AxesHelper } from 'ogl';

export class EditorRenderer extends Renderer {
    private orbit!: Orbit;

    protected init() {
        // сетка
        const grid = new GridHelper(this.gl.gl, { size: 10, divisions: 10 });
        grid.position.y = -0.001;
        grid.setParent(this.scene);

        // оси
        const axes = new AxesHelper(this.gl.gl, { size: 6, symmetric: true });
        axes.setParent(this.scene);

        // orbit
        this.orbit = new Orbit(this.camera);
    }

    protected update() {
        this.orbit.update();
    }
}
