import { initRenderScript } from '../../src/initRenderScript';

initRenderScript(
  document.getElementById('root')!,
  '/dist/squares/worker.js'
);
