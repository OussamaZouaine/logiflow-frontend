/** Page index or ellipsis marker for compact pagination controls. */
export type PaginationItem = number | "ellipsis";

/**
 * Builds a compact page list with ellipsis, e.g. [0, 1, 2, "ellipsis", 9].
 * `currentPage` and returned numbers are zero-based.
 */
export function buildPaginationRange(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  if (totalPages <= 1) {
    return [];
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const lastPage = totalPages - 1;
  const siblings = 1;
  const left = Math.max(1, currentPage - siblings);
  const right = Math.min(lastPage - 1, currentPage + siblings);
  const pages: number[] = [0];

  if (left > 1) {
    pages.push(-1);
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < lastPage - 1) {
    pages.push(-1);
  }

  if (lastPage > 0) {
    pages.push(lastPage);
  }

  const deduped: PaginationItem[] = [];
  for (const page of pages) {
    if (page === -1) {
      if (deduped.at(-1) !== "ellipsis") {
        deduped.push("ellipsis");
      }
      continue;
    }
    if (!deduped.includes(page)) {
      deduped.push(page);
    }
  }

  return deduped;
}
