let globalRenderIndex = 0;

export function zeroizeRenderIndex (): void {
  globalRenderIndex = 0;
}

export function getRenderIndex (): number {
  return globalRenderIndex++;
}
