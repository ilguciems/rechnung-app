import { fireEvent, waitFor } from "@testing-library/react";
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

describe("RevenueChart", () => {
  beforeEach(() => {
    rechartsImports.count = 0;
  });

  it("reports a rejected recharts import instead of leaving an unhandled rejection", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { findByRole } = renderWithIntl(<RevenueChart data={[]} />);

    expect(await findByRole("alert")).toHaveTextContent(
      "Das Diagramm konnte nicht geladen werden.",
    );
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toBe("Failed to load recharts");
  });

  it("loads recharts again when the retry button is pressed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { findByRole, getByRole } = renderWithIntl(
      <RevenueChart data={[]} />,
    );

    await findByRole("alert");
    expect(rechartsImports.count).toBe(1);

    fireEvent.click(getByRole("button", { name: "Erneut versuchen" }));

    await waitFor(() => expect(rechartsImports.count).toBe(2));
    expect(await findByRole("alert")).toBeInTheDocument();
  });
});
