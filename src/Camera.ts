import { ReadonlyVec3, mat4 } from "gl-matrix";

export class Camera {
    private Width  = 640;
    private Height = 480;

    private angle  = 90;
    private fov    = (this.angle * Math.PI) / 180.0;
    private aspect = this.Width / this.Height;
    private near   = 1;
    private far    = 100;

    private eye: ReadonlyVec3    = [0, 0, 5];
    private target: ReadonlyVec3 = [0, 0, 0];
    private up: ReadonlyVec3     = [0, 1, 0];

    private projectionMatrix: mat4;
    private viewMatrix: mat4

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
    }

    public getProjection() {
        return this.projectionMatrix;
    }

    public getView() {
        return this.viewMatrix;
    }
}