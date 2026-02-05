import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { togglePaidSpy } from "@/tests/mocks/handlers";
import Providers from "../../providers";
import InvoicesListSection from "../InvoicesListSection";

window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();
HTMLAnchorElement.prototype.click = vi.fn();

describe("InvoicesListSection", () => {
  const user = userEvent.setup();

  it("renders invoice and interacts (toggle paid and download)", async () => {
    render(
      <Providers>
        <InvoicesListSection />
      </Providers>,
    );

    expect(
      await screen.findByText("Gespeicherte Rechnungen"),
    ).toBeInTheDocument();

    const invoiceNumberElement = await screen.findByText("INV-123");
    expect(invoiceNumberElement).toBeInTheDocument();

    const invoiceRow = invoiceNumberElement.closest("li");
    expect(invoiceRow).toBeInTheDocument();

    expect(
      within(invoiceRow as HTMLElement).getByText("Offen"),
    ).toBeInTheDocument();

    const actionButton = within(invoiceRow as HTMLElement).getByRole("button", {
      name: /aktionen/i,
    });
    await user.click(actionButton);

    const setPaidMenuItem = await screen.findByText(/Bezahlt setzen/i);
    expect(setPaidMenuItem).toBeInTheDocument();

    await user.click(setPaidMenuItem);

    await waitFor(() => {
      expect(togglePaidSpy).toHaveBeenCalledTimes(1);
      expect(togglePaidSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: "1" }),
      );
    });

    await user.click(actionButton);

    const downloadMenuItem = await screen.findByText("Rechnung als PDF");
    await user.click(downloadMenuItem);

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
  });
});
