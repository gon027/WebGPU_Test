import { ReadonlyVec3, mat4, quat, vec3 } from "gl-matrix";

export class Transform {
    private position: ReadonlyVec3;
    private rotation: ReadonlyVec3;
    private scale: ReadonlyVec3;

    private worldMatrix: mat4;

    constructor(){
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.scale = [1, 1, 1];
        this.worldMatrix = mat4.create();
    }

    public update() {
        const q = quat.create();
        quat.fromEuler(q, this.rotation[0], this.rotation[1], this.rotation[2]);
        mat4.fromRotationTranslationScale(
            this.worldMatrix,
            q,
            this.position,
            this.scale
        );
    }

    public setPosition(_position: ReadonlyVec3){
        this.position = _position;
    }

    public setRotation(_rotation: ReadonlyVec3){
        this.rotation = _rotation;
    }

    public setScale(_scale: ReadonlyVec3){
        this.scale = _scale;
    }

    public get getWorldMatrix() : mat4 {
        return this.worldMatrix;
    }
    
}