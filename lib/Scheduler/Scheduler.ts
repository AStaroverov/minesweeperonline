import { TaskQueue } from './TaskQueue';
import { ITask } from '../Renderer/src/types';

const push = Array.prototype.push;

export class Scheduler extends TaskQueue {
  public traverse (): void {
    this.run();

    let next: void | ITask[];
    let task: ITask;
    let index: number = 0;
    const tasks = [...(this.next() || [])];
    const indexStack: number[] = [-1];
    const indexStops: number[] = [tasks.length];

    task = tasks[index];

    while (task !== undefined) {
      task.run();
      next = task.next && task.next();

      if (next !== undefined && next.length !== 0) {
        push.apply(tasks, next);
        indexStack.push(index + 1);
        indexStops.push(tasks.length);
        index = tasks.length - next.length;
      } else {
        index++;
      }

      while (index === indexStops[indexStops.length - 1]) {
        index = indexStack.pop()!;
        indexStops.pop();
      }

      task = tasks[index];
    }
  }
}
