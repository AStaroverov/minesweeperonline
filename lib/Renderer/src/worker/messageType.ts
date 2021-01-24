export const enum MessageType {
  WORKER_INIT = "WORKER_INIT",
  SEND_INIT_DATA = "SEND_INIT_DATA",
  SEND_EVENT = "SEND_EVENT"
}

export interface TMessageTypeToPayload {
  [MessageType.SEND_INIT_DATA]: {
    devicePixelRatio: number
    canvases: OffscreenCanvas[]
  }
  [MessageType.SEND_EVENT]: {
    event: Event
  }
  [MessageType.WORKER_INIT]: {}
}

export function typedPostMessage<Type extends MessageType, Payload extends TMessageTypeToPayload[Type]> (
  ctx: Worker | DedicatedWorkerGlobalScope, type: Type, payload?: Payload, transfer?: Transferable[]
): void {
  try {
    ctx.postMessage({ type, payload }, transfer || []);
  } catch (err: unknown) {
    throw new Error(`Can't send message to worker - ${(err as Error).message}`);
  }
}

export function typedListenMessage<Type extends MessageType, Payload extends TMessageTypeToPayload[Type]> (
  ctx: Worker | DedicatedWorkerGlobalScope,
  type: Type,
  listener: (event: MessageEvent<{ type: Type, payload: Payload}>) => void
): VoidFunction {
  const cb = (event): void => {
    if (event.data.type === type) {
      listener(event);
    }
  };
  ctx.addEventListener('message', cb);

  return () => ctx.removeEventListener('message', cb);
}

export async function typedPromiseMessage<Type extends MessageType, Payload extends TMessageTypeToPayload[Type]> (
  ctx: Worker | DedicatedWorkerGlobalScope,
  type: Type
): Promise<Payload> {
  return await new Promise((resolve) => {
    const remove = typedListenMessage(ctx, type, ({ data }) => {
      remove();
      resolve(data.payload as Payload);
    });
  });
}
