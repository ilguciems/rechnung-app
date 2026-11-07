import {
  CHART_PAGE_SIZE,
  describeChartWindow,
  getChartWindow,
} from "../chart-window";

const months = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    month: `M${index + 1}`,
    monthKey: `2026-${String(index + 1).padStart(2, "0")}`,
  }));

describe("getChartWindow", () => {
  it("shows everything when the range fits on one page", () => {
    const { visible, canPrev, canNext } = getChartWindow(months(3), 0);

    expect(visible).toHaveLength(3);
    expect(canPrev).toBe(false);
    expect(canNext).toBe(false);
  });

  it("pages through a twelve month range", () => {
    const first = getChartWindow(months(12), 0);
    expect(first.visible.map((item) => item.month)).toEqual([
      "M1",
      "M2",
      "M3",
      "M4",
      "M5",
      "M6",
    ]);
    expect(first.canPrev).toBe(false);
    expect(first.canNext).toBe(true);

    const second = getChartWindow(months(12), 1);
    expect(second.visible.map((item) => item.month)).toEqual([
      "M7",
      "M8",
      "M9",
      "M10",
      "M11",
      "M12",
    ]);
    expect(second.canPrev).toBe(true);
    expect(second.canNext).toBe(false);
  });

  it("clamps the last page so it stays full", () => {
    const second = getChartWindow(months(11), 1);

    expect(second.offset).toBe(5);
    expect(second.visible.map((item) => item.month)).toEqual([
      "M6",
      "M7",
      "M8",
      "M9",
      "M10",
      "M11",
    ]);
    expect(second.canNext).toBe(false);
  });

  it("ignores a page that is out of range", () => {
    const { visible, canPrev, canNext } = getChartWindow(months(3), 4);

    expect(visible).toHaveLength(3);
    expect(canPrev).toBe(false);
    expect(canNext).toBe(false);
    expect(CHART_PAGE_SIZE).toBe(6);
  });
});

describe("describeChartWindow", () => {
  it("names a window inside a single year", () => {
    expect(
      describeChartWindow([
        { month: "Jan", monthKey: "2026-01" },
        { month: "Jun", monthKey: "2026-06" },
      ]),
    ).toBe("Jan – Jun 2026");
  });

  it("names a window that crosses the year boundary", () => {
    expect(
      describeChartWindow([
        { month: "Dez", monthKey: "2025-12" },
        { month: "Mai", monthKey: "2026-05" },
      ]),
    ).toBe("Dez 2025 – Mai 2026");
  });

  it("handles a single month and an empty range", () => {
    expect(describeChartWindow([{ month: "Nov", monthKey: "2026-11" }])).toBe(
      "Nov 2026",
    );
    expect(describeChartWindow([])).toBe("");
  });
});
