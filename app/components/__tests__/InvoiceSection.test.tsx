import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import Providers from "../../providers";
import InvoiceSection from "../InvoiceSection";

// mock toast
vi.mock("react-hot-toast", async () => {
  return {
    __esModule: true,
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
    success: vi.fn(),
    error: vi.fn(),
  };
});

describe("InvoiceSection", () => {
  it("creates invoice successfully", async () => {
    render(
      <Providers>
        <InvoiceSection />
      </Providers>,
    );

    expect(await screen.findByText(/Neue Rechnung/i)).toBeInTheDocument();

    await userEvent.type(
      screen.getByLabelText(/Kundenname/i),
      "Max Mustermann",
    );
    await userEvent.type(screen.getByLabelText(/Strasse/i), "Teststrasse");
    await userEvent.type(screen.getByLabelText(/Hausnummer/i), "99");
    await userEvent.type(screen.getByLabelText(/PLZ/i), "12345");
    await userEvent.type(screen.getByLabelText(/Ort/i), "Berlin");

    await userEvent.type(
      screen.getByLabelText(/Warenbeschreibung/i),
      "Service",
    );
    await userEvent.type(screen.getByLabelText(/Menge/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/Steuersatz/i), "19");
    await userEvent.type(screen.getByLabelText(/Preis/i), "100");

    await userEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Rechnung erstellt!"),
    );
  });
});
