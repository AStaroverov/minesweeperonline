import { Layer } from '../lib/Renderer/src/layers/Layer';
import { render } from '../lib/Renderer/src/render';
import { Root } from './view';
import { scheduler } from '../lib/Scheduler';
import { getWorkerScope } from '../lib/Renderer/src/worker/getWorkerScope';
import { getInitData } from '../lib/Renderer/src/worker/getInitData';
import { createField } from './field';

async function main (): Promise<void> {
  const workerScope = await getWorkerScope();
  const { canvases, devicePixelRatio } = await getInitData(workerScope);

  (function tick () {
    scheduler.traverse();
    requestAnimationFrame(tick);
  })();

  render(
    workerScope,
    new Root(
      devicePixelRatio,
      createField(10, 10, 3),
      new Layer(canvases[0], 0)
    )
  );
}

main();
