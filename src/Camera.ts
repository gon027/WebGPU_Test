import { ReadonlyVec3, mat3, mat4, vec3, vec4 } from "gl-matrix";

export class Camera {
    private Width  = 640;
    private Height = 480;

    private angle  = 90;
    private fov    = (this.angle * Math.PI) / 180.0;
    private aspect = this.Width / this.Height;
    private near   = 1;
    private far    = 100;

    private eye   : vec3 = [0, 0, 5];
    private target: vec3 = [0, 0, 0];
    private up    : vec3 = [0, 1, 0];

    private projectionMatrix: mat4;
    private viewMatrix: mat4

    private touchStartPoint: vec3 = vec3.create();  // クリックされた時の座標
    private isTouch: Boolean = false;               // クリックされたか

    constructor() {
        this.projectionMatrix = mat4.create();
        {
            mat4.perspective(
                this.projectionMatrix,
                this.fov,
                this.aspect,
                this.near,
                this.far
            );
        }

        this.viewMatrix = mat4.create();
        {
            mat4.lookAt(
                this.viewMatrix,
                this.eye,
                this.target,
                this.up
            );
        }

        window.addEventListener("mousedown", this.onMouseDown.bind(this));
        window.addEventListener("mouseup", this.onMouseUp.bind(this));
        window.addEventListener("mousemove", this.onMouseDrag.bind(this));
    }

    public update() {
        {
            mat4.lookAt(
                this.viewMatrix,
                this.eye,
                this.target,
                this.up
            );
        }
    }

    public move(v: vec3) {
        vec3.add(this.eye, this.eye, v);
        vec3.add(this.target, this.target, v);
        this.update();
    }

    public rotateY(rad: number) {
        const m = mat4.create();
        mat4.fromYRotation(m, rad);

        const t = this.transformCoord([0, 0, 1], m);
        vec3.add(this.target, t, this.eye);

        this.up = this.transformCoord([0, 1, 0], m);
        
        this.update();
    }

    public getProjection() {
        return this.projectionMatrix;
    }

    public getView() {
        return this.viewMatrix;
    }

    private onMouseDown(event) {
        const rect = event.target.getBoundingClientRect();

        const posX = event.clientX - rect.left;
        const posY = event.clientY - rect.top;
        console.log("x: %d, y: %d", posX, posY);

        this.touchStartPoint = vec3.fromValues(posX, posY, 0.0);
        this.isTouch = true;
    }

    private onMouseUp(event) {
        this.isTouch = false;
        this.touchStartPoint = vec3.create();
        console.log("fgasopfjsaeiof");
    }

    private onMouseDrag(event) {
        if(!this.isTouch) return;

        const rect = event.target.getBoundingClientRect();

        const posX = event.clientX - rect.left;
        const posY = event.clientY - rect.top;

        const current = vec3.fromValues(posX, posY, 0.0);

        const dist = vec3.create();
        vec3.sub(dist, current, this.touchStartPoint);

        const mx = dist[0] / this.Width;
        const my = dist[1] / this.Height;
        this.move([mx, -my, 0]);

        this.touchStartPoint = current;
    }

    public transformCoord(v: vec3, m: mat4): vec3 {
        const x = v[0], y = v[1], z = v[2];
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];
        
        const tw = 1 / (x * m03 + y * m13 + z * m23 + m33); 

        const tx = x * m00 + y * m10 + z * m20 + m30;
        const ty = x * m01 + y * m11 + z * m21 + m31; 
        const tz = x * m02 + y * m12 + z * m22 + m31; 

        return vec3.fromValues(tx * tw, ty * tw, tz * tw);
    }
}