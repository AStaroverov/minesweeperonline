import { scheduler, TaskQueue } from '../../../Scheduler';
import { render } from '../../src/render';
import { BaseComponent } from '../../src/BaseComponent';
import { createElement, withDeclarativeSetChildren } from '../../src/mixins/withDeclarativeSetChildren';
import { getInitData } from '../../src/worker/getInitData';
import { getWorkerScope } from '../../src/worker/getWorkerScope';
import { CanvasEvent } from '../../src/worker/events/defs';

main();

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

  const colors = [
    'red', 'purple', 'green', 'grey', 'blue'
  ];

  const MIN_SIZE = 100;

  class Coube extends withDeclarativeSetChildren(BaseComponent) {
    private color = colors[Math.floor(Math.random() * 5)];
    private dragging = false;

    constructor (
      public props: { x: number, y: number, s: number, d: number, stopPropagation: boolean }
    ) {
      super();

      this.setHitBox(this.props.x, this.props.y, this.props.s + this.props.x, this.props.s + this.props.y);
      this.addEventListener('click', this.onClick);
      this.addEventListener('mousedown', (event) => {
        event.stopPropagation();
        this.dragging = true;
        this.requestUpdate();
      });
      root.addEventListener('mousemove', this.onMove);
      root.addEventListener('mouseup', (event) => {
        if (this.dragging) {
          this.setHitBox(this.props.x, this.props.y, this.props.s + this.props.x, this.props.s + this.props.y);
          this.dragging = false;
          this.requestUpdate();
        }
      });
      root.addEventListener('mouseleave', () => {
        if (this.dragging) {
          this.setHitBox(this.props.x, this.props.y, this.props.s + this.props.x, this.props.s + this.props.y);
          this.dragging = false;
          this.requestUpdate();
        }
      });
    }

    protected connected (): void {
      super.connected();

      this.updateChildren();
    }

    protected render (): void {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.props.x, this.props.y, this.props.s, this.props.s);
      ctx.strokeStyle = 'black';
      ctx.lineWidth = this.dragging ? 4 : 1;
      ctx.strokeRect(this.props.x, this.props.y, this.props.s, this.props.s);
    }

    protected updateChildren (): void {
      if (MIN_SIZE > this.props.s) {
        return;
      }

      this.setChildren([
        createElement(Coube, {
          ...this.props,
          s: this.props.s / this.props.d | 0
        })
      ]);
    }

    private onClick = (event: CanvasEvent<MouseEvent>): void => {
      this.color = colors[Math.floor(Math.random() * 5)];
      this.requestUpdate();

      if (this.props.stopPropagation) {
        event.stopPropagation();
      }
    };

    private onMove = (event: CanvasEvent<MouseEvent>): void => {
      if (this.dragging) {
        this.props.x += event.movementX;
        this.props.y += event.movementY;
        this.requestUpdate();
      }
    };
  }

  class Root extends withDeclarativeSetChildren(BaseComponent) {
    protected connected (): void {
      super.connected();

      this.setHitBox(
        0, 0, 10000, 10000
      );
      this.updateChildren();
    }

    protected render (): void {
      ctx.fillStyle = 'black';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    protected updateChildren (): void {
      this.setChildren([
        createElement(
          Coube, {
            x: 0,
            y: 0,
            s: 500,
            d: 1.5,
            stopPropagation: false
          }
        ),
        createElement(
          Coube, {
            x: 600,
            y: 100,
            s: 400,
            d: 1.8,
            stopPropagation: true
          }
        )
      ]);
    }
  }

  const root = new Root();

  render(workerScope, root);
}
