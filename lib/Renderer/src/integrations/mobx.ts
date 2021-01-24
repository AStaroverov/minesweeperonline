import { makeObservable } from 'mobx';
import { deepObserve } from 'mobx-utils';
import { TConstructor } from '../types';
import { BaseComponent } from '../BaseComponent';

const DISPOSER = Symbol('DISPOSER');
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function observeComponent<
  Context extends object = object,
  Base extends TConstructor<BaseComponent<Context>> = TConstructor<BaseComponent<Context>>,
> (base: Base) {
  return class Observable extends base {
    private [DISPOSER]: VoidFunction;

    constructor (...args: any[]) {
      super(...args);

      this[DISPOSER] = deepObserve(makeObservable(this), _ => {
        this.requestUpdate();
      });
    }

    protected disconnected (): void {
      super.disconnected();

      this[DISPOSER]();
    }
  };
}
