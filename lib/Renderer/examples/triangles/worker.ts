import { scheduler, TaskQueue, Task } from '../../../Scheduler';
import { render } from '../../src/render';
import { TComponentData } from '../../src/types';
import { BaseComponent } from '../../src/BaseComponent';
import { createElement, withDeclarativeSetChildren } from '../../src/mixins/withDeclarativeSetChildren';
import { getInitData } from '../../src/worker/getInitData';
import { getWorkerScope } from '../../src/worker/getWorkerScope';

main();

type TContext = {
  x: number
  y: number
  angle: number
};

async function main (): Promise<void> {
  const workerScope = await getWorkerScope();
  const { canvases } = await getInitData(workerScope);
  const canvas = canvases[0];
  const ctx = canvas.getContext('2d')!;

  const queue = new TaskQueue();

  scheduler.add(queue);

  (function tick () {
    scheduler.traverse();
    requestAnimationFrame(tick);
  })();

  const targetSize = 24;

  class Dot extends BaseComponent<TContext> {
    constructor (
      protected props: {
        x: number
        y: number
        s: number
      }
    ) {
      super();
    }

    p1: { x: number, y: number } = { x: 0, y: 0 };
    p2: { x: number, y: number } = { x: 0, y: 0 };
    p3: { x: number, y: number } = { x: 0, y: 0 };

    render (): void {
      const props = this.props;
      const halfS = props.s / 2;
      const x = props.x + halfS;
      const y = props.y + halfS;

      this.p1.x = x;
      this.p1.y = y;

      this.p2.x = x - halfS;
      this.p2.y = y + halfS;

      this.p3.x = x + halfS;
      this.p3.y = y + halfS;

      rotatePoint(this.p1, this.context, this.context.angle);
      rotatePoint(this.p2, this.context, this.context.angle);
      rotatePoint(this.p3, this.context, this.context.angle);

      ctx.moveTo(this.p1.x, this.p1.y);
      ctx.lineTo(this.p2.x, this.p2.y);
      ctx.lineTo(this.p3.x, this.p3.y);
      ctx.lineTo(this.p1.x, this.p1.y);
    }
  }

  class Triangle extends withDeclarativeSetChildren(BaseComponent) {
    constructor (
      protected props: {
        x: number
        y: number
        s: number
      }
    ) {
      super();
    }

    protected connected (): void {
      super.connected();
      this.setChildren(this.updateChildren());
    }

    updateChildren (): TComponentData[] {
      let { s, x, y } = this.props;

      if (s <= targetSize) {
        return [
          createElement(Dot, {
            x: x - (targetSize / 2),
            y: y - (targetSize / 2),
            s: targetSize
          })
        ];
      }

      s /= 2;

      return [
        createElement(
          Triangle,
          {
            x,
            y: y - (s / 2),
            s
          }
        ),
        createElement(
          Triangle,
          {
            x: x - s,
            y: y + (s / 2),
            s
          }
        ),
        createElement(
          Triangle,
          {
            x: x + s,
            y: y + (s / 2),
            s
          }
        )
      ];
    }
  }

  class Fill extends BaseComponent {
    protected render (): void {
      ctx.closePath();
      ctx.fill();
    }
  }

  class Root extends withDeclarativeSetChildren(BaseComponent)<TContext> {
    constructor () {
      super();

      queue.add(new Task(() => {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        this.context.angle = this.context.angle + 0.01;
        this.requestUpdate();
      }));
    }

    protected connected (): void {
      super.connected();

      this.context = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        angle: 0
      };

      this.setChildren(this.updateChildren());
    }

    protected render (): void {
      ctx.fillStyle = 'blue';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
    }

    protected updateChildren (): TComponentData[] {
      return [
        createElement(
          Triangle,
          {
            x: this.context.x,
            y: this.context.y,
            s: 800
          }
        ),
        createElement(Fill)
      ];
    }
  }

  render(workerScope, new Root());
}

function rotatePoint<T extends { x: number, y: number }> (point: T, pivotPoint: T, angle: number): T {
  const s: number = Math.sin(angle);
  const c: number = Math.cos(angle);

  // translate point back to origin:
  point.x -= pivotPoint.x;
  point.y -= pivotPoint.y;

  // rotate point
  const newX: number = point.x * c - point.y * s;
  const newY: number = point.x * s + point.y * c;

  // translate point back:
  point.x = newX + pivotPoint.x;
  point.y = newY + pivotPoint.y;

  return point;
}
