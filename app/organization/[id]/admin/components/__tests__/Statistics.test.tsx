import { fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/tests/test-utils";
import Statistics from "../Statistics";

vi.mock("next/navigation", () => {
  const searchParams = new URLSearchParams();

  return {
    usePathname: () => "/",
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    useSearchParams: () => searchParams,
  };
});

vi.mock("@teispace/next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

// The chart library is irrelevant here; the loading state is what matters.
vi.mock("recharts", () => {
  throw new Error("recharts is not needed in this test");
});

const statsPayload = (monthCount: number) =>
  new Response(
    JSON.stringify({
      stats: {
        totalRevenue: 1000,
        pendingAmount: 200,
        overdueAmount: 50,
        expectedNext14Days: 10,
      },
      chartData: Array.from({ length: monthCount }, (_, index) => ({
        monthKey: `2026-${String(index + 1).padStart(2, "0")}`,
        month: `M${index + 1}`,
        revenue: 100,
        pending: 20,
      })),
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );

describe("Statistics", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    // The default range resolves; every other range stays pending forever.
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();
      const range = new URL(url, "http://localhost").searchParams.get("range");

      return range === "6m"
        ? Promise.resolve(statsPayload(6))
        : new Promise<Response>(() => {});
    });
  });

  it("keeps the range filter mounted while the next range loads", async () => {
    const { findByText, getByRole, container } = renderWithIntl(<Statistics />);

    await findByText("Gesamtumsatz");
    const filterBefore = container.querySelector("fieldset");
    expect(filterBefore).not.toBeNull();
    expect(container.querySelector(".animate-pulse")).toBeNull();

    fireEvent.click(getByRole("button", { name: "12 Monate" }));

    // Loading branch: skeleton instead of the cards, but the pills stay.
    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(container.querySelector("section[aria-labelledby]")).toBeNull();

    const filterDuringLoad = container.querySelector("fieldset");
    expect(filterDuringLoad).toBe(filterBefore);
    expect(getByRole("button", { name: "12 Monate" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
