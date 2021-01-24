import EventEmitter from 'eventemitter3';

export type TCameraServiceOptions = {
  x?: number
  y?: number
  width?: number
  height?: number
  scale?: number
  scaleMin?: number
  scaleMax?: number
  speedZoom?: number
};

type TMoveData = {
  sx: number
  sy: number
  esx: number
  esy: number
};

type TMatrix = {
  x: number
  y: number
  scale: number
};

export class CameraService extends EventEmitter {
  static toFixed = toFixed;
  static clamp = clamp;

  static SCALE_MIN: number = 0.001;
  static SCALE_MAX: number = 100;

  public x: number = 0;
  public y: number = 0;
  public width: number = 0;
  public height: number = 0;
  public scale: number = 1;
  public relativeX: number = 0;
  public relativeY: number = 0;
  public relativeWidth: number = 0;
  public relativeHeight: number = 0;
  public prevState: {
    x: number
    y: number
    width: number
    height: number
    scale: number
    relativeX: number
    relativeY: number
    relativeWidth: number
    relativeHeight: number
  } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 0.5,
    relativeX: 0,
    relativeY: 0,
    relativeWidth: 0,
    relativeHeight: 0
  };

  private savedMatrix: TMatrix[] = [];

  private scaleMin: number = CameraService.SCALE_MIN;
  private scaleMax: number = CameraService.SCALE_MAX;
  private speedZoom: number = 1;
  private moveData: TMoveData = {
    sx: 0,
    sy: 0,
    esx: 0,
    esy: 0
  };

  constructor (params?: TCameraServiceOptions) {
    super();

    this.scaleMin = CameraService.SCALE_MIN;

    if (params) {
      this.set(params);
    }
  }

  public set (params: TCameraServiceOptions): void {
    this.updatePrevState();
    Object.assign(this, params);
    this.updateRelative();
    this.updateWorld();
  }

  public saveMatrix (): void {
    this.savedMatrix.push({ x: this.x, y: this.y, scale: this.scale });
  }

  public restoreMatrix (): void {
    this.set(this.savedMatrix.pop()!);
  }

  public getMatrixAsArray (): [number, number, number, number, number, number] {
    return [this.scale, 0, 0, this.scale, this.x, this.y];
  }

  public getMatrixAsObject (): {
    a: number
    b: number
    c: number
    d: number
    e: number
    f: number
  } {
    return {
      a: this.scale,
      b: 0,
      c: 0,
      d: this.scale,
      e: this.x,
      f: this.y
    };
  }

  public move (dx: number = 0, dy: number = 0): void{
    this.set({
      x: (this.x + dx) | 0,
      y: (this.y + dy) | 0
    });
  }

  public moveStart (x: number, y: number): void {
    this.moveData.sx = this.x;
    this.moveData.sy = this.y;
    this.moveData.esx = x;
    this.moveData.esy = y;
  }

  public moveUpdate (x: number, y: number): void {
    this.set({
      x: this.moveData.sx - (this.moveData.esx - x) * this.speedZoom | 0,
      y: this.moveData.sy - (this.moveData.esy - y) * this.speedZoom | 0
    });
  }

  public setScale (scale): void {
    this.set({ scale: clamp(scale, this.scaleMin, this.scaleMax) });
  }

  public zoom (...args: number[]);
  public zoom (x: number, y: number, delta: number): void {
    if (delta === 0) { return; }

    if (delta < 0) {
      if (this.scaleMax !== this.scale) { this.zoomOut(Math.abs(delta), x, y); }
    } else {
      if (this.scaleMin !== this.scale) { this.zoomIn(Math.abs(delta), x, y); }
    }
  }

  private zoomIn (delta: number, x = this.x, y = this.y): void {
    const dx1 = this.getRelative(x - this.x);
    const dy1 = this.getRelative(y - this.y);

    const scale = Math.max(this.scale - delta, this.scaleMin);

    const dx2 = this.getRelative(x - this.x, scale);
    const dy2 = this.getRelative(y - this.y, scale);

    this.zoomEnd(scale, dx1, dy1, dx2, dy2);
  }

  private zoomOut (delta: number, x = this.x, y = this.y): void {
    const dx1 = this.getRelative(x - this.x);
    const dy1 = this.getRelative(y - this.y);

    const scale = Math.min(this.scale + delta, this.scaleMax);

    const dx2 = this.getRelative(x - this.x, scale);
    const dy2 = this.getRelative(y - this.y, scale);

    this.zoomEnd(scale, dx1, dy1, dx2, dy2);
  }

  private zoomEnd (scale: number, dx1: number, dy1: number, dx2: number, dy2: number): void {
    this.set({
      scale: toFixed(scale, 3),
      x: this.x - ((dx2 - dx1) * scale) | 0,
      y: this.y - ((dy2 - dy1) * scale) | 0
    });
  }

  private updateRelative (): void {
    this.relativeX = this.getRelative(this.x) | 0;
    this.relativeY = this.getRelative(this.y) | 0;
    this.relativeWidth = this.getRelative(this.width) | 0;
    this.relativeHeight = this.getRelative(this.height) | 0;
  }

  private updatePrevState (): void {
    this.prevState.x = this.x;
    this.prevState.y = this.y;
    this.prevState.width = this.width;
    this.prevState.height = this.height;
    this.prevState.scale = this.scale;
    this.prevState.relativeX = this.relativeX;
    this.prevState.relativeY = this.relativeY;
    this.prevState.relativeWidth = this.relativeWidth;
    this.prevState.relativeHeight = this.relativeHeight;
  }

  private getRelative (n: number, scale: number = this.scale): number {
    return n / scale;
  }

  private updateWorld (): void {
    this.emit('updated', this);
  }

  public applyToPoint (...arg: number[]): [number, number];
  public applyToPoint (x: number, y: number): [number, number] {
    return [
      this.getRelative(x) - this.relativeX | 0,
      this.getRelative(y) - this.relativeY | 0
    ];
  }

  public applyToRect (...arg: number[]): [number, number, number, number];
  public applyToRect (x, y, w, h): [number, number, number, number] {
    const p = this.applyToPoint(x, y);

    return [
      p[0],
      p[1],
      this.getRelative(w) | 0,
      this.getRelative(h) | 0
    ];
  }
}

function clamp (v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

function toFixed (num: number, digits: number, base: number = 10): number {
  const pow = Math.pow(base, digits);

  return Math.round(num * pow) / pow;
}
