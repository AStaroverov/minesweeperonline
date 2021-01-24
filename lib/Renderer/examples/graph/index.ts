import { initRenderScript } from '../../src/initRenderScript';

initRenderScript(
  document.getElementById('root')!,
  '/dist/graph/worker.js'
);
