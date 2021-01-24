import { scheduler, TaskQueue, Task } from '../../../Scheduler';
import { BaseComponent } from '../../src/BaseComponent';
import { render } from '../../src/render';
import { getWorkerScope } from '../../src/worker/getWorkerScope';
import { Layer } from '../../src/layers/Layer';
import { LayersManager } from '../../src/layers/LayersManager';
import { getInitData } from '../../src/worker/getInitData';
import { withLayers } from '../../src/mixins/withLayers';
import { observeComponent } from '../../src/integrations/mobx';
import { action, observable } from 'mobx';

main();

type TContext = {
  layersManager: LayersManager
};

async function main (): Promise<void> {
  const workerScope = await getWorkerScope();
  const { canvases } = await getInitData(workerScope);
  const layersManager = new LayersManager({
    first: new Layer(canvases[0]),
    second: new Layer(canvases[1])
  });

  const queue = new TaskQueue();

  scheduler.add(queue);

  (function tick () {
    scheduler.traverse();
    requestAnimationFrame(tick);
  })();

  @observeComponent
  class Coube extends withLayers(BaseComponent)<TContext> {
    @observable
    public state: { dx: number, dy: number } = { dx: 0, dy: 0 };

    protected layer: typeof layersManager.layers[keyof typeof layersManager.layers];
    protected r = 0;
    protected count = 0;
    protected delta = 0;

    constructor (public props: { x: number, y: number, s: number}) {
      super();
    }

    protected connected (): void {
      super.connected();

      this.layer = this.attachToLayer(this.context.layersManager.layers.first);
      queue.add(new Task(this.changeCoordinat, this));
    }

    protected render (): void {
      this.layer.ctx.fillRect(this.props.x + this.state.dx, this.props.y + this.state.dy, this.props.s, this.props.s);
    }

    @action
    protected changeCoordinat (): void {
      this.r = Math.random();
      this.delta += 0.01 * (this.r > 0.5 ? 1 : -1);
      this.count += this.delta;

      this.state.dx = Math.sin(this.count) * 10;
      this.state.dy = Math.cos(this.count) * 10;
    }
  }

  class Root extends BaseComponent<TContext> {
    size = 400;
    rows = layersManager.list[0].canvas.width / this.size | 0;

    protected connected (): void {
      super.connected();

      this.context.layersManager = layersManager;

      for (let i = 0; i < 3; i += 1) {
        this.appendChild(
          new Coube(
            {
              x: (i % this.rows) * this.size,
              y: (i / this.rows | 0) * this.size,
              s: this.size
            }
          )
        );
      }
    }

    protected render (): void {
      layersManager.prepareToFrame();
      layersManager.list.forEach(l => {
        if (l.isDirty) {
          l.ctx.fillStyle = 'black';
          l.ctx.clearRect(0, 0, l.canvas.width, l.canvas.height);
        }
      });
    }
  }

  render(workerScope, new Root());
}
