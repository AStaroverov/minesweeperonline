import { BaseComponent, PRIVATE_CONTEXT } from '../BaseComponent';
import { TComponentConstructor } from '../types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function withdDrag<Base extends TComponentConstructor<BaseComponent>> (base: Base) {
  return class WithdDrag extends base {
    public listenDrag (callbacks: {
      onDragStart?: EventListenerOrEventListenerObject
      onDragMove?: EventListenerOrEventListenerObject
      onDragEnd?: EventListenerOrEventListenerObject
    }): void {
      const root = this[PRIVATE_CONTEXT]!.root;
      const dragEnd = (event: MouseEvent): void => {
        if (typeof callbacks.onDragEnd === 'function') {
          callbacks.onDragEnd(event);
        } else if (typeof callbacks.onDragEnd === 'object') {
          callbacks.onDragEnd.handleEvent(event);
        }

        if (callbacks.onDragStart !== undefined) {
          this.removeEventListener('mousedown', callbacks.onDragStart);
        }
        if (callbacks.onDragMove !== undefined) {
          root.removeEventListener('mousemove', callbacks.onDragMove);
        }
        root.removeEventListener('mouseup', dragEnd);
      };

      if (callbacks.onDragStart !== undefined) {
        this.addEventListener('mousedown', callbacks.onDragStart);
      }
      if (callbacks.onDragMove !== undefined) {
        root.addEventListener('mousemove', callbacks.onDragMove);
      }

      root.addEventListener('mouseup', dragEnd);
    }
  };
}
