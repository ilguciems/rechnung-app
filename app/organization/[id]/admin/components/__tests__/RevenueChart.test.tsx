import { fireEvent, waitFor } from "@testing-library/react";
import type { ChartDataType } from "@/hooks";
import { renderWithIntl } from "@/tests/test-utils";
import { RevenueChart } from "../RevenueChart";

vi.mock("@teispace/next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

// Simulates a chunk that fails to load, e.g. the stale chunk a browser still
// references after a deployment replaced it.
const rechartsImports = vi.hoisted(() => ({ count: 0 }));
vi.mock("recharts", () => {
  rechartsImports.count += 1;
  throw new Error("Failed to fetch dynamically imported module");
});

const months = (count: number): ChartDataType =>
  Array.from({ length: count }, (_, index) => ({
    month: `M${index + 1}`,
    monthKey: `2026-${String(index + 1).padStart(2, "0")}`,
    pending: 100,
    revenue: 200,
  }));

describe("RevenueChart", () => {
  beforeEach(() => {
    rechartsImports.count = 0;
  });

  it("reports a rejected recharts import instead of leaving an unhandled rejection", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { findByRole } = renderWithIntl(
      <RevenueChart
        title="Umsatzübersicht"
        data={[]}
        page={0}
        onPageChange={vi.fn()}
      />,
    );

    expect(await findByRole("alert")).toHaveTextContent(
      "Das Diagramm konnte nicht geladen werden.",
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toBe("Failed to load recharts");
  });

  it("loads recharts again when the retry button is pressed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { findByRole, getByRole } = renderWithIntl(
      <RevenueChart
        title="Umsatzübersicht"
        data={[]}
        page={0}
        onPageChange={vi.fn()}
      />,
    );

    await findByRole("alert");
    expect(rechartsImports.count).toBe(1);

    fireEvent.click(getByRole("button", { name: "Erneut versuchen" }));

    await waitFor(() => expect(rechartsImports.count).toBe(2));
    expect(await findByRole("alert")).toBeInTheDocument();
  });

  it("pages through a range that holds more months than fit", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onPageChange = vi.fn();

    const { findByRole, getByRole } = renderWithIntl(
      <RevenueChart
        title="Umsatzübersicht"
        data={months(12)}
        page={0}
        onPageChange={onPageChange}
      />,
    );

    expect(await findByRole("alert")).toBeInTheDocument();
    expect(getByRole("button", { name: "Vorherige Monate" })).toBeDisabled();

    fireEvent.click(getByRole("button", { name: "Nächste Monate" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("disables the next page on the last page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { findByRole, getByRole } = renderWithIntl(
      <RevenueChart
        title="Umsatzübersicht"
        data={months(12)}
        page={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(await findByRole("alert")).toBeInTheDocument();
    expect(getByRole("button", { name: "Vorherige Monate" })).toBeEnabled();
    expect(getByRole("button", { name: "Nächste Monate" })).toBeDisabled();
  });

  it("hides the arrows when the range fits on one page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { findByRole, queryByRole } = renderWithIntl(
      <RevenueChart
        title="Umsatzübersicht"
        data={months(6)}
        page={0}
        onPageChange={vi.fn()}
      />,
    );

    expect(await findByRole("alert")).toBeInTheDocument();
    expect(queryByRole("button", { name: "Vorherige Monate" })).toBeNull();
    expect(queryByRole("button", { name: "Nächste Monate" })).toBeNull();
  });
});
