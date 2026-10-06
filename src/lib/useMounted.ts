import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** false no servidor e durante a hidratação; true no navegador depois disso. */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
