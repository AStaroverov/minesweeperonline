import { MessageType, typedPostMessage, typedPromiseMessage } from './worker/messageType';
import { PseudoWorker } from '../../PseudoWorker';
import { PIXEL_RATIO } from './utils/pixelRatio';
import { dispatcherEventToWorker } from './worker/events/dispatcherEventToWorker';

const offscreenCanvasesSupported = HTMLCanvasElement.prototype.transferControlToOffscreen !== undefined;

export async function initRenderScript (
  root: HTMLElement,
  pathToScript: string
): Promise<Worker> {
  const canvases = Array.from(root.querySelectorAll('canvas'));
  const WorkerConstructor = offscreenCanvasesSupported ? Worker : PseudoWorker;
  const worker = (new WorkerConstructor(pathToScript)) as Worker;

  canvases.forEach(updateCanvasSize);

  await typedPromiseMessage(worker, MessageType.WORKER_INIT);

  if (offscreenCanvasesSupported) {
    const offscreenCanvases = canvases.map(canvas => canvas.transferControlToOffscreen());

    typedPostMessage(
      worker,
      MessageType.SEND_INIT_DATA,
      { devicePixelRatio: PIXEL_RATIO, canvases: offscreenCanvases },
      offscreenCanvasesSupported ? offscreenCanvases : []
    );
  } else {
    typedPostMessage(worker, MessageType.SEND_INIT_DATA, {
      devicePixelRatio: PIXEL_RATIO,
      canvases: canvases as unknown as OffscreenCanvas[]
    });
  }

  const removeEventDispatcher = dispatcherEventToWorker(worker, root);
  const nativeTerminate = worker.terminate;

  worker.terminate = () => {
    nativeTerminate.call(worker);
    removeEventDispatcher();
  };

  return worker;
}

function updateCanvasSize (canvas: HTMLCanvasElement): void {
  const size = canvas.getBoundingClientRect();

  canvas.width = size.width * PIXEL_RATIO;
  canvas.height = size.height * PIXEL_RATIO;
}
