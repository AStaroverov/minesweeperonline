let globalRenderId = 0;

export function updateRenderId (): void {
  globalRenderId++;
}

export function getRenderId (): number {
  return globalRenderId;
}
