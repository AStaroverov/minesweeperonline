import { MessageType, typedPostMessage } from '../messageType';
import { CanvasEvent, CanvasMouseEvent, FIELDS_FOR_COPY } from './defs';

export function dispatcherEventToWorker (worker: Worker, root: Element): VoidFunction {
  const redispatch = <E extends Event>(event: E): void => {
    const canvasEvent: CanvasEvent<E> = createEventData<E>(event);

    if (event instanceof MouseEvent) {
      mutateTargetEvent(canvasEvent as unknown as CanvasMouseEvent, event, root.getBoundingClientRect());
    }

    typedPostMessage(worker, MessageType.SEND_EVENT, { event: canvasEvent });
  };

  root.addEventListener('click', redispatch);
  root.addEventListener('mousemove', redispatch);
  root.addEventListener('mousedown', redispatch);
  root.addEventListener('mouseup', redispatch);
  root.addEventListener('mouseenter', redispatch);
  root.addEventListener('mouseleave', redispatch);

  root.addEventListener('wheel', redispatch, { passive: true });

  root.addEventListener('keydown', redispatch);
  root.addEventListener('keypress', redispatch);
  root.addEventListener('keyup', redispatch);

  return () => {
    root.removeEventListener('click', redispatch);
    root.removeEventListener('mousemove', redispatch);
    root.removeEventListener('mousedown', redispatch);
    root.removeEventListener('mouseup', redispatch);
    root.removeEventListener('mouseenter', redispatch);
    root.removeEventListener('mouseleave', redispatch);

    root.removeEventListener('wheel', redispatch);

    root.removeEventListener('keydown', redispatch);
    root.removeEventListener('keypress', redispatch);
    root.removeEventListener('keyup', redispatch);
  };
}

function createEventData<E extends Event> (event: E): CanvasEvent<E> {
  const eventData: CanvasEvent<E> = {} as any;

  FIELDS_FOR_COPY.forEach(key => {
    if (key in event) {
      eventData[key] = event[key];
    }
  });

  return eventData;
}

function mutateTargetEvent (canvasEvent: CanvasMouseEvent, parentEvent: MouseEvent, rect: DOMRect): void {
  canvasEvent.clientX = parentEvent.clientX - rect.left;
  canvasEvent.clientY = parentEvent.clientY - rect.top;
  canvasEvent.x = canvasEvent.clientX;
  canvasEvent.y = canvasEvent.clientY;
  canvasEvent.movementX = parentEvent.movementX;
  canvasEvent.movementY = parentEvent.movementY;
}
