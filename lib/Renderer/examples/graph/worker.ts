import { render } from '../../src/render';
import { LayersManager } from '../../src/layers/LayersManager';
import { Layer } from '../../src/layers/Layer';
import { init } from '../commmon/init';
import { GraphRoot, TLayers } from '../commmon/graph';

async function main (): Promise<void> {
  const {
    workerScope,
    canvases,
    devicePixelRatio
  } = await init();

  const layersManager = new LayersManager<TLayers>({
    connections: new Layer(canvases[0]),
    nodes: new Layer(canvases[1]),
    dragging: new Layer(canvases[2])
  });

  render(workerScope, new GraphRoot(layersManager, devicePixelRatio));
}

main();
