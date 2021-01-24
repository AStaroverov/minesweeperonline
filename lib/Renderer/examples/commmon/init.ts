import { scheduler, TaskQueue, Scheduler } from '../../../Scheduler';
import { getInitData } from '../../src/worker/getInitData';
import { getWorkerScope } from '../../src/worker/getWorkerScope';
import { LayersManager } from '../../src/layers/LayersManager';
import { Layer } from '../../src/layers/Layer';

export async function init (): Promise<{
  workerScope: DedicatedWorkerGlobalScope
  canvases: OffscreenCanvas[]
  devicePixelRatio: number
  queue: TaskQueue
  scheduler: Scheduler
  layersManager: LayersManager
}> {
  const workerScope = await getWorkerScope();
  const { canvases, devicePixelRatio } = await getInitData(workerScope);

  const queue = new TaskQueue();

  scheduler.add(queue);

  const layersManager = new LayersManager({
    first: new Layer(canvases[0]),
    second: new Layer(canvases[1]),
    third: new Layer(canvases[2])
  });

  (function tick () {
    scheduler.traverse();
    requestAnimationFrame(tick);
  })();

  return {
    workerScope,
    canvases,
    devicePixelRatio,
    queue,
    scheduler,
    layersManager
  };
}
