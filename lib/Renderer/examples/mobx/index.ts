import { initRenderScript } from '../../src/initRenderScript';

initRenderScript(
  document.getElementById('root')!,
  '/dist/mobx/worker.js'
);
