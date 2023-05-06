import { Primitive } from "./Primitive";

export class Box {
    static create(): Primitive {
        const primitive = new Primitive();

        primitive.vertices = new Float32Array([
            -0.5,  0.5,  0.5, 0.5,  0, 0, 1, 1,
            -0.5, -0.5,  0.5, 0.5,  0, 0, 1, 1,
            0.5, -0.5,  0.5, 0.5,  0, 1, 0, 1,
            0.5,  0.5,  0.5, 0.5,  0, 1, 0, 1,
            0.5, -0.5, -0.5, 0.5,  1, 0, 0, 1,
            0.5,  0.5, -0.5, 0.5,  1, 0, 0, 1,
            -0.5, -0.5, -0.5, 0.5,  1, 0, 1, 1,
            -0.5,  0.5, -0.5, 0.5,  1, 0, 1, 1,
        ]);

        primitive.indices = new Uint16Array([
            0, 1, 2, 0, 2, 3,
            3, 2, 4, 3, 4, 5,
            5, 4, 6, 5, 6, 7,
            7, 6, 1, 7, 1, 0,
            7, 0, 3, 7, 3, 5,
            6, 1, 2, 6, 2, 4,
        ]);

        return primitive;
    }
}