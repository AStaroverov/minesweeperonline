import { CanvasEvent, shouldPreventDefault, shouldStopImmediatePropagation } from '../worker/events/defs';

type TEventType = string;

export class EvTarget implements EventTarget {
  private eventsMap: Record<TEventType, EventListenerOrEventListenerObject[]> = {};

  public hasEventListener (type): boolean {
    return this.eventsMap[type] !== undefined;
  }

  public addEventListener (type: TEventType, listener: EventListenerOrEventListenerObject): void {
    if (Array.isArray(this.eventsMap[type])) {
      this.eventsMap[type].push(listener);
    } else {
      this.eventsMap[type] = [listener];
    }
  }

  public removeEventListener (type: TEventType, listener: EventListenerOrEventListenerObject): void {
    if (Array.isArray(this.eventsMap[type])) {
      const i = this.eventsMap[type].indexOf(listener);

      if (i !== -1) {
        this.eventsMap[type].splice(i, 1);
      }
    }
  }

  public removeEventListeners(): void {
    // @ts-ignore
    this.eventsMap = undefined;
  }

  public hasListener (type: TEventType): boolean {
    return this.eventsMap !== undefined && this.eventsMap[type] !== undefined;
  }

  public dispatchEvent<E extends CanvasEvent>(event: E): boolean {
    if (!this.hasListener(event.type)) {
      return event[shouldPreventDefault];
    }

    const listeners: EventListenerOrEventListenerObject[] = this.eventsMap[event.type];

    for (let i = 0; i < listeners.length; i += 1) {
      const listener = listeners[i];

      if (typeof listener === 'function') {
        listener(event);
      } else if (typeof listener === 'object' && typeof listener.handleEvent === 'function') {
        listener.handleEvent(event);
      }

      if (event[shouldStopImmediatePropagation]) {
        break;
      }
    }

    return event[shouldPreventDefault];
  }
}
