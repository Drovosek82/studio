"use client";

import { useBms } from './bms-context';

/**
 * A proxy hook for BmsContext to maintain backward compatibility with existing components.
 */
export function useBmsStore() {
  return useBms();
}
