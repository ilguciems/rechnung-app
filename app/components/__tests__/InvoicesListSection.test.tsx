import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Providers from "../../providers";
import InvoicesListSection from "../InvoicesListSection";

window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();
HTMLAnchorElement.prototype.click = vi.fn();

describe("InvoicesListSection", () => {
  const user = userEvent.setup();

  it("renders invoice and interacts", async () => {
    render(
      <Providers>
        <InvoicesListSection />
      </Providers>,
    );

    expect(
      await screen.findByText("Gespeicherte Rechnungen"),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("INV-123")).toBeInTheDocument(),
    );

    expect(screen.getByText("Offen")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Bezahlt setzen/i }));

    expect(await screen.findByText("Bezahlt")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /PDF herunterladen/i }),
    );

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
  });
});
