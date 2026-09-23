export const LIST_PAGE_SIZE_OPTIONS = [10, 15, 20] as const;

export const DEFAULT_LIST_PAGE_SIZE = 20;

/** Guards httpResource params when pageSize is briefly unset during binding. */
export function resolveListPageSize(size: number | undefined): number {
  if (size === undefined || !Number.isFinite(size) || size < 1) {
    return DEFAULT_LIST_PAGE_SIZE;
  }
  return size;
}
