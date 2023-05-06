export class UniformBuffer {
    private device: GPUDevice;

    private buffer: GPUBuffer;
    private bufferSize: number;

    constructor(device: GPUDevice, bufferSize: number) {
        this.device = device;
        this.bufferSize = bufferSize;

        this.buffer = this.device.createBuffer({
            size: this.bufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
    }

    public writeBuffer(bufferOffset, data, dataOffset, size) {
        this.device.queue.writeBuffer(
            this.buffer,
            bufferOffset,
            data,
            dataOffset,
            size
        );
    }

    public get getBuffer() : GPUBuffer {
        return this.buffer;
    }
    
}