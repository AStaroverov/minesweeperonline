import { TaskQueue } from './TaskQueue';
import { noop } from '../Renderer/src/utils';
import { ITask } from '../Renderer/src/types';

export interface OptionsTask {
  order?: number
  once?: true
  context?: object
}

export class Task implements ITask {
  fn: (frameTime?: number) => void;
  context: object | null;
  once: boolean;
  order: number;

  constructor (fn: () => (boolean | void), context: object | null = null, options?: OptionsTask) {
    this.fn = fn;
    this.context = context;

    this.once = Boolean(options?.once);
    this.order = options?.order ?? 0;
  }

  public run (parentQueue: TaskQueue): void {
    this.fn.call(this.context);

    if (this.once) {
      this.run = noop;
      parentQueue.scheduleFilterItems();
    }
  }

  public next (): void {}
}
