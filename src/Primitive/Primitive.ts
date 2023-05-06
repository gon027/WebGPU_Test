export class Primitive {
    public vertices: Float32Array = [];
    public indices: Uint16Array = [];

    public get vertexLength() : number {
        return this.vertices.length;
    }

    public get indexLength() : number {
        return this.indices.length;
    }
}