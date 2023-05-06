export const vertShader: string = `
struct Uniforms {
    projectionMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    // worldMatrix: mat4x4<f32>,
}
@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct World {
    worldMatrix: mat4x4<f32>
}
@binding(1) @group(1) var<uniform> world: World;

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragColor: vec4<f32>,
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    // @location(2) pos: vec2<f32>
) -> VertexOutput {
    var output: VertexOutput;
    // output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * world.worldMatrix * (position + vec4<f32>(pos.x, pos.y, 0, 1));
    output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * world.worldMatrix * position;
    output.fragColor = color;

    return output;
}
`