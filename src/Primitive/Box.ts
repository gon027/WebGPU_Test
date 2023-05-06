export class Box {
    static vertexSize = 4 * 8;
    static positionOffset = 4 * 0;
    static colorOffset = 4 * 4;

    static boxVertexArray = new Float32Array([
        -0.5,  0.5,  0.5, 0.5,  0, 0, 1, 1,
        -0.5, -0.5,  0.5, 0.5,  0, 0, 1, 1,
        0.5, -0.5,  0.5, 0.5,  0, 1, 0, 1,
        0.5,  0.5,  0.5, 0.5,  0, 1, 0, 1,
        0.5, -0.5, -0.5, 0.5,  1, 0, 0, 1,
        0.5,  0.5, -0.5, 0.5,  1, 0, 0, 1,
        -0.5, -0.5, -0.5, 0.5,  1, 0, 1, 1,
        -0.5,  0.5, -0.5, 0.5,  1, 0, 1, 1,
    ]);

    static boxIndexArray = new Uint16Array([
        0, 1, 2, 0, 2, 3,
        3, 2, 4, 3, 4, 5,
        5, 4, 6, 5, 6, 7,
        7, 6, 1, 7, 1, 0,
        7, 0, 3, 7, 3, 5,
        6, 1, 2, 6, 2, 4,
    ]);
}