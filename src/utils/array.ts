export function swapRemove(array: unknown[], index: number): void {
  if (index < 0 || index >= array.length) return;

  const last = array.pop();

  if (index < array.length && last !== undefined) array[index] = last;
}
