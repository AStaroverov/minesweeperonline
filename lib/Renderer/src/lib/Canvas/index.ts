const stopNumber = 2147483647;

export interface CanvasSnapshot extends CanvasFillStrokeStyles, CanvasRect, CanvasDrawPath, CanvasText, CanvasTextDrawingStyles, CanvasPath {}

export class CanvasSnapshot {
  private snapshot: Array<string | number> = [stopNumber];

  private writeIndex = 0;
  private stopIndex = 0;

  private readonly fields = Object.create(null);

  private doMethod (method: string, args: Array<string | number>): void {
    this.snapshot[this.writeIndex++] = method;
    this.snapshot[this.writeIndex++] = args.length;

    for (let i = 0; i < args.length; i++) {
      this.snapshot[this.writeIndex++] = args[i];
    }
  }

  private doSetter (prop: string, value: (string | number)): void {
    this.snapshot[this.writeIndex++] = 'setter';
    this.snapshot[this.writeIndex++] = prop;
    this.snapshot[this.writeIndex++] = value;
  }

  public begin () {
    this.stopIndex = 0;
    this.writeIndex = 0;
  }

  public end () {
    this.stopIndex = this.writeIndex;
  }

  public render (ctx: CanvasRenderingContext2D) {
    const l = this.snapshot.length;
    let i = 0;
    let method: string;
    let argsCount: number;

    while (i < l) {
      if (i === this.stopIndex) {
        break;
      }

      method = this.snapshot[i] as string;

      if (method === 'setter') {
        ctx[this.snapshot[i + 1]] = this.snapshot[i + 2];
        i += 3;
      } else {
        argsCount = this.snapshot[i + 1] as number;
        fastCall(ctx, method, this.snapshot, i + 2, argsCount);
        i += 2 + argsCount;
      }
    }
  }
}

[
  'clearRect',
  'fillRect',
  'strokeRect',
  'beginPath',
  'arc',
  'arcTo',
  'bezierCurveTo',
  'closePath',
  'ellipse',
  'lineTo',
  'moveTo',
  'quadraticCurveTo',
  'rect',
  'createLinearGradient',
  'createPattern',
  'createRadialGradient'
].forEach((method) => {
  CanvasSnapshot.prototype[method] = function (...args: unknown[]) {
    this.doMethod(method, args);
  };
});

[
  'direction',
  'font',
  'textAlign',
  'textBaseline',
  'fillStyle',
  'strokeStyle'
].forEach((prop) => {
  Object.defineProperty(CanvasSnapshot.prototype, prop, {
    set (value) {
      this.doSetter(prop, value);
      this.fields[prop] = value;
    },
    get () {
      return this.fields[prop];
    }
  });
});

function fastCall (ctx, method: string, arr: Array<number | string>, startIndex: number, count: number) {
  switch (count) {
    case 0: return ctx[method]();
    case 1: return ctx[method](arr[startIndex]);
    case 2: return ctx[method](arr[startIndex], arr[startIndex + 1]);
    case 3: return ctx[method](arr[startIndex], arr[startIndex + 1], arr[startIndex + 2]);
    case 4: return ctx[method](arr[startIndex], arr[startIndex + 1], arr[startIndex + 2], arr[startIndex + 3]);
    case 5: return ctx[method](arr[startIndex], arr[startIndex + 1], arr[startIndex + 2], arr[startIndex + 3], arr[startIndex + 4]);
    case 6: return ctx[method](arr[startIndex], arr[startIndex + 1], arr[startIndex + 2], arr[startIndex + 3], arr[startIndex + 4], arr[startIndex + 5]);
  }
}
