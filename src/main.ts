"use strict";

import { mat4 } from "gl-matrix";
import { Camera } from "./Camera";
import { App } from "./App";
import { vertShader } from "./shader/vert";
import { fragShader } from "./shader/frag";
import { Box } from "./Mesh/Box";

window.addEventListener(
    "DOMContentLoaded", 
    init as EventListenerOrEventListenerObject
);

const CanvasWidth: number = 640;
const CanvasHeight: number = 480;

// デバイス類
// let context: GPUCanvasContext = null;
// let adapter: Promis<GPUAdapter?> = null;
// let device: Promis<GPUDevice> = null;

// シェーダ類
const vShader = `
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
`;

const fShader = `
    @fragment
    fn main(
        @location(0) fragColor: vec4<f32>,
    ) -> @location(0) vec4<f32> {
        return fragColor;
    }
`;

async function init() {
    if(!navigator.gpu){
        console.log("aaa");
        return;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if(!adapter){
        return;
    }
    console.log(adapter);

    const device = await adapter!.requestDevice();
    if(!device){
        return;
    }
    console.log(device);

    const canvas: HTMLCanvasElement = document.getElementById("canvas");
    canvas.width = CanvasWidth;
    canvas.height = CanvasHeight;

    const context = canvas.getContext("webgpu") as GPUCanvasContext;
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device: device,
        format: presentationFormat,
        alphaMode: 'opaque'
    });
    console.log(context);

    // const app = new App(device, context);
    // app.run();

    const test = new Test(device, context);
    test.run();
}

export class Test {
    private device;
    private context;

    private camera: Camera;

    private quadVertexArray: Float32Array;
    private quadIndexArray: Uint16Array;

    private verticesBuffer: GPUBuffer;
    private indicesBuffer: GPUBuffer;

    private pipeline: GPURenderPipeline;
    private depthTexture: GPUTexture;

    private cameraUniformBuffer: GPUBuffer;
    private worldUniformBuffer: GPUBuffer
    private cameraUniformBindGroup: GPUBufferBinding;
    private worldUniformBindGroup : GPUBufferBinding;

    private box2UniformBindGroup: GPUBufferBinding;
    private box2WorldMatrix: mat4 = mat4.create();

    constructor(device: GPUDevice, context: GPUCanvasContext) {
        this.device = device;
        this.context = context;
        this.camera = new Camera();

        this.quadVertexArray = Box.boxVertexArray;
        this.quadIndexArray = Box.boxIndexArray;
    }

    public run() {
        this.init();
    }

    private init() {
        // Vertex
        const quadVertexSize = 4 * 8;
        const quadPositionOffset = 4 * 0;
        const quadColorOffset = 4 * 4;

        {
            this.verticesBuffer = this.device.createBuffer({
                size: this.quadVertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true
            });
            new Float32Array(this.verticesBuffer.getMappedRange()).set(this.quadVertexArray);
            this.verticesBuffer.unmap();
        }

        // Index
        {
            this.indicesBuffer = this.device.createBuffer({
                size: this.quadIndexArray.byteLength,
                usage: GPUBufferUsage.INDEX,
                mappedAtCreation: true,
            })
            new Uint16Array(this.indicesBuffer.getMappedRange()).set(this.quadIndexArray);
            this.indicesBuffer.unmap();
        }

        // Uniforms
        // Camera UniformBuffer
        {
            const uniformBufferSize = 4 * (4 * 4) * 2;  // viewMatrix and projectionMatrix
            this.cameraUniformBuffer = this.device.createBuffer({
                size: uniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        }

        // WorldUniformBuffer

        const MatrixSize = 4 * (4 * 4);
        const Offset = 256;
        const uniformBufferSize = Offset + MatrixSize;
        {
            this.worldUniformBuffer = this.device.createBuffer({
                size: uniformBufferSize, // 4 * (4 * 4), /* 4byte * 4row * 4col */
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        }

        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: this.device.createShaderModule({
                    code: vShader
                }),
                entryPoint: 'main',
                buffers: [
                    {
                        arrayStride: quadVertexSize,
                        stepMode: 'vertex',
                        attributes: [
                            {
                                shaderLocation: 0,
                                offset: quadPositionOffset,
                                format: 'float32x4'
                            },
                            {
                                shaderLocation: 1,
                                offset: quadColorOffset,
                                format: 'float32x4'
                            }
                        ]
                    },
                ]
            },
            fragment: {
                module: /* GPUShaderModule */ this.device.createShaderModule({
                    code: fShader
                }),
                entryPoint: "main",
                targets: [
                    {
                        format: navigator.gpu.getPreferredCanvasFormat()
                    }
                ]
            },
            primitive: {
                topology: 'triangle-list',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            },
        });

        {
            this.cameraUniformBindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),  // @group(1)
                entries: [
                    {
                        binding: 0,  // @binding(0)
                        resource: {
                            buffer: this.cameraUniformBuffer
                        }
                    }
                ]
            });
        }

        {
            this.worldUniformBindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(1),  // @group(1)
                entries: [
                    {
                        binding: 1,  // @binding(1)
                        resource: {
                            buffer: this.worldUniformBuffer,
                            offset: 0,
                            size: MatrixSize
                        }
                    }
                ]
            });
        }

        {
            this.box2UniformBindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(1),  // @group(1)
                entries: [
                    {
                        binding: 1,
                        resource: {
                            buffer: this.worldUniformBuffer,
                            offset: Offset,
                            size: MatrixSize
                        }
                    }
                ]
            });
        }


        this.depthTexture = this.device.createTexture({
            size: [CanvasWidth, CanvasHeight],
            format:'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        {
            const proj = this.camera.getProjection();
            this.device.queue.writeBuffer(
                this.cameraUniformBuffer,
                4 * 16 * 0,  // 0
                proj.buffer,
                proj.byteOffset,
                proj.byteLength
            );
        
            const view = this.camera.getView();
            this.device.queue.writeBuffer(
                this.cameraUniformBuffer,
                4 * 16 * 1,  // 64
                view.buffer,
                view.byteOffset,
                view.byteLength
            );
        }

        this.update(); 
    }

    private update() {
        const commandEncoder: GPUCommandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.5, b: 0.75, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store'
                }
            ],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };

        this.updateTransformMatrix(this.worldUniformBuffer);

        {
            this.box2WorldMatrix = mat4.create();
            mat4.translate(
                this.box2WorldMatrix,
                this.box2WorldMatrix,
                [2, 0, 0]
            );

            this.device.queue.writeBuffer(
                this.worldUniformBuffer,
                256,
                this.box2WorldMatrix.buffer,
                this.box2WorldMatrix.byteOffset,
                this.box2WorldMatrix.byteLength
            );
        }

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        {
            passEncoder.setPipeline(this.pipeline);

            passEncoder.setBindGroup(0, this.cameraUniformBindGroup);

            passEncoder.setVertexBuffer(0, this.verticesBuffer);
            passEncoder.setIndexBuffer(this.indicesBuffer, 'uint16');

            passEncoder.setBindGroup(1, this.worldUniformBindGroup);
            passEncoder.drawIndexed(this.quadIndexArray.length);

            passEncoder.setBindGroup(1, this.box2UniformBindGroup);
            passEncoder.drawIndexed(this.quadIndexArray.length);
        }
        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.update.bind(this));
    }

    private updateTransformMatrix(uniformBuffer: GPUBuffer) {
        const worldMatrix = mat4.create();
        const now = Date.now() / 1000;

        mat4.translate(
            worldMatrix,
            worldMatrix,
            [-2, 0, 0]
        );

        this.device.queue.writeBuffer(
            uniformBuffer,
            4 * 16 * 0,
            worldMatrix.buffer,
            worldMatrix.byteOffset,
            worldMatrix.byteLength
        );
        // console.log(worldMatrix);
    }
}