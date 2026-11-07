export const CHART_PAGE_SIZE = 6;

export type ChartWindow<T> = {
  offset: number;
  visible: T[];
  canPrev: boolean;
  canNext: boolean;
};

type ChartMonth = {
  month: string;
  monthKey: string;
};

/**
 * Slice of the chart data for one page. The last page is clamped to the end of
 * the data, so a range whose length is not a multiple of the page size shows a
 * full window that overlaps the previous one instead of a short stub.
 */
export function getChartWindow<T>(
  items: T[],
  page: number,
  size: number = CHART_PAGE_SIZE,
): ChartWindow<T> {
  const requestedPage = Number.isFinite(page)
    ? Math.max(0, Math.trunc(page))
    : 0;
  const maxOffset = Math.max(0, items.length - size);
  const offset = Math.min(requestedPage * size, maxOffset);

  return {
    offset,
    visible: items.slice(offset, offset + size),
    canPrev: offset > 0,
    canNext: offset + size < items.length,
  };
}

/** "Jan – Jun 2026", "Dez 2025 – Mai 2026" — labels already come localized. */
export function describeChartWindow(months: ChartMonth[]): string {
  if (months.length === 0) return "";

  const first = months[0];
  const last = months[months.length - 1];
  const firstYear = first.monthKey.slice(0, 4);
  const lastYear = last.monthKey.slice(0, 4);

  if (first.monthKey === last.monthKey) return `${first.month} ${firstYear}`;

  if (firstYear === lastYear) {
    return `${first.month} – ${last.month} ${lastYear}`;
  }

  return `${first.month} ${firstYear} – ${last.month} ${lastYear}`;
}
