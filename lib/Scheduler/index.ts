import { Scheduler } from './Scheduler';

export * from './Scheduler';
export * from './TaskQueue';
export * from './Task';

const scheduler = new Scheduler();

export { scheduler };
