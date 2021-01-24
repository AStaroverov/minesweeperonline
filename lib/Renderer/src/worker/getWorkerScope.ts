import { MessageType, typedPostMessage } from './messageType';

let scope: DedicatedWorkerGlobalScope;

export function getWorkerScope (): DedicatedWorkerGlobalScope {
  if (scope) {
    return scope;
  }

  if (globalThis.document === undefined) {
    scope = globalThis as unknown as DedicatedWorkerGlobalScope;
  } else {
    scope = globalThis.__workerContext__;
    globalThis.__workerContext__ = undefined;
  }

  if (scope === undefined) {
    throw new Error('worker scope is undefined');
  }

  typedPostMessage(scope, MessageType.WORKER_INIT);

  return scope;
}
