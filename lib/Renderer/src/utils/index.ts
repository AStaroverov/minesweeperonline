export const EMPTY_ARRAY = Object.freeze([]) as unknown as any[];

export function noop (): void {}

export function isMetaKeyEvent<E extends (KeyboardEvent | MouseEvent)> (event: E): boolean {
  return event.metaKey || event.ctrlKey;
}
export function isAltKeyEvent<E extends KeyboardEvent> (event: E): boolean {
  return event.altKey;
}
export function isShiftKeyEvent<E extends KeyboardEvent> (event: E): boolean {
  return event.shiftKey;
}
export function isNewTabEvent<E extends MouseEvent> (event: E): boolean {
  return isMetaKeyEvent(event) || (event.button === 1);
}

export function isMacOs (): boolean {
  return navigator.appVersion.indexOf('Mac') !== -1;
}

export function isWindows (): boolean {
  return navigator.appVersion.indexOf('Win') !== -1;
}
