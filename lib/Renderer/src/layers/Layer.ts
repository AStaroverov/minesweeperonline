import { vec2, mat4 } from 'gl-matrix';

export interface ILayer extends Layer {}

export class Layer<
  Canvas extends OffscreenCanvas | HTMLCanvasElement = OffscreenCanvas,
  Ctx = Canvas extends OffscreenCanvas ? OffscreenCanvasRenderingContext2D : CanvasRenderingContext2D
> {
  public ctx: Ctx;

  public isDirty: boolean = true;
  public willDirty: boolean = true;
  public eventTransformMatrix: mat4 = mat4.create();

  constructor (
    public canvas: Canvas,
    public zIndex: number,
    createRenderContext?: (canas: Canvas) => Ctx
  ) {
    this.ctx = createRenderContext !== undefined
      ? createRenderContext(this.canvas)
      : createDefaultRenderContext<Canvas, Ctx>(this.canvas);
  }

  public updateImmediate (): void {
    this.isDirty = true;
  }

  public update (): void {
    this.willDirty = true;
  }

  public nextFrame (): void {
    this.isDirty = this.willDirty;
    this.willDirty = false;
  }

  public setTransformMatrix (matrix: mat4): void {
    mat4.copy(this.eventTransformMatrix, matrix);
  }

  public getTransformedVec2 (out: vec2, matrix: mat4 = this.eventTransformMatrix): vec2 {
    // TODO: try use vec2.transformMat4
    out[0] = (out[0] + matrix[12]) * matrix[0];
    out[1] = (out[1] + matrix[13]) * matrix[5];

    return out;
  }
}

function createDefaultRenderContext<
  Canvas extends OffscreenCanvas | HTMLCanvasElement,
  Ctx = Canvas extends OffscreenCanvas ? OffscreenCanvasRenderingContext2D : CanvasRenderingContext2D
> (canvas: Canvas): Ctx {
  return canvas.getContext('2d') as unknown as Ctx;
}
