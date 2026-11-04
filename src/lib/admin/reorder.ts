/** 순서를 바꿔 저장하고, 저장이 실패하면(save 가 던지면) 이전 순서를 돌려준다. */
export async function reorderWithRollback<T extends { id: string }>(
  order: T[],
  next: T[],
  save: (ids: string[]) => void | Promise<void>,
  apply: (order: T[]) => void,
): Promise<boolean> {
  apply(next);
  try {
    await save(next.map((i) => i.id));
    return true;
  } catch {
    apply(order);
    return false;
  }
}
