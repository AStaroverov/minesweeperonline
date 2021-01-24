import { initRenderScript } from '../../src/initRenderScript';

initRenderScript(
  document.getElementById('root')!,
  '/dist/camera/worker.js'
);
