import { BaseComponent, PRIVATE_CONTEXT } from './BaseComponent';
import { scheduler } from '../../Scheduler';
import { updateRenderId } from './prototypes/helpers/renderId';
import { zeroizeRenderIndex } from './prototypes/helpers/renderIndex';
import { workerEventRedispatcher } from './worker/events/workerEventRedispatcher';
import { HitBoxMap } from './prototypes/helpers/hitBoxServerice';
import { EMPTY_ARRAY } from './utils';

export function render<Component extends BaseComponent> (
  workerScope: DedicatedWorkerGlobalScope,
  rootComponent: Component
): void {
  const onlyRoot = [rootComponent];

  let scheduled = true;
  // eslint-disable-next-line new-cap
  rootComponent.context = rootComponent.context || {};
  rootComponent[PRIVATE_CONTEXT] = {
    root: rootComponent,
    hitBoxMap: new HitBoxMap(),
    scheduleUpdate: (): void => {
      scheduled = true;
    }
  };
  // @ts-expect-error
  rootComponent.connected();

  scheduler.add({
    run () {},
    next (): Component[] {
      if (scheduled) {
        scheduled = false;

        zeroizeRenderIndex();
        updateRenderId();

        return onlyRoot;
      }

      return EMPTY_ARRAY;
    }
  });

  workerEventRedispatcher(workerScope, rootComponent[PRIVATE_CONTEXT]!);
}
