import { MessageType, TMessageTypeToPayload, typedPromiseMessage } from './messageType';

export async function getInitData (
  workerScope: DedicatedWorkerGlobalScope
): Promise<TMessageTypeToPayload[MessageType.SEND_INIT_DATA]> {
  return await typedPromiseMessage(workerScope, MessageType.SEND_INIT_DATA);
}
