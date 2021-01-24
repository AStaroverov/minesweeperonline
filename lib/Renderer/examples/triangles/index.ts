import { initRenderScript } from '../../src/initRenderScript';

initRenderScript(
  document.getElementById('root')!,
  '/dist/triangles/worker.js'
);
