import { noop } from '../Renderer/src/utils';
import { ITask } from '../Renderer/src/types';

export interface OptionsItems {
  order?: number
}

export class TaskQueue implements ITask {
  public order: number;
  public items: ITask[] = [];

  protected sheduledFilterItems: boolean = false;
  protected sheduledFilterItemsCount: number = 0;

  constructor (options?: OptionsItems) {
    this.order = options?.order || 0;
  }

  public add (...tasks: ITask[]): void {
    this.items.push(...tasks);
  }

  public remove (task: ITask): void {
    const i = this.items.indexOf(task);

    if (i > -1) {
      this.items.splice(i, 1);
    }
  }

  public run (): void {
    if (this.sheduledFilterItems && this.sheduledFilterItemsCount > 10) {
      this.filterItems();
    }
  }

  public next (): ITask[] | void {
    return this.items;
  }

  public scheduleFilterItems (): void {
    this.sheduledFilterItemsCount += 1;
    this.sheduledFilterItems = true;
  }

  public clearItems (): void {
    this.items = [];
  }

  protected filterItems (): void {
    this.sheduledFilterItemsCount = 0;
    this.sheduledFilterItems = false;
    this.items = this.items.filter((task) => task.run !== noop);
  }
}
