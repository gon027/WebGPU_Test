export const fragShader: string = `
@fragment
fn main(
    @Location(0) fragColor: vec4<f32>
) -> @Location(0) vec4<f32> {
    return fragColor;
}
`