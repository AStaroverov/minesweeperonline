import { TMutable } from '../../types';
import { Knot } from '../../prototypes/Knot';

export type withPath = { path: Knot[] };
export type CanvasEvent<E extends Event = Event> = TMutable<E> & withPath;
export type CanvasMouseEvent<E extends MouseEvent = MouseEvent> = TMutable<E> & withPath;

export const shouldStopImmediatePropagation = Symbol('shouldStopImmediatePropagation');
export const shouldStopPropagation = Symbol('shouldStopPropagation');
export const shouldPreventDefault = Symbol('shouldPreventDefault');

export const FIELDS_FOR_COPY = [
  'AT_TARGET',
  'BUBBLING_PHASE',
  'CAPTURING_PHASE',
  'NONE',
  'altKey',
  'bubbles',
  'button',
  'buttons',
  'cancelBubble',
  'cancelable',
  'clientX',
  'clientY',
  'composed',
  'ctrlKey',
  'defaultPrevented',
  'detail',
  'eventPhase',
  'isTrusted',
  'layerX',
  'layerY',
  'metaKey',
  'movementX',
  'movementY',
  'offsetX',
  'offsetY',
  'pageX',
  'pageY',
  'returnValue',
  'screenX',
  'screenY',
  'shiftKey',
  'timeStamp',
  'type',
  'which',
  'x',
  'y',
  'wheelDelta',
  'wheelDeltaX',
  'wheelDeltaY',
  'deltaMode',
  'deltaX',
  'deltaY',
  'deltaZ',
  'detail',
  'eventPhase'
];
