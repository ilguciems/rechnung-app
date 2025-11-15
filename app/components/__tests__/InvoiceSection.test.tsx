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
  it("creates invoice for new customer", async () => {
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
  it("creates invoice for existing customer and product (with autocomplete)", async () => {
    render(
      <Providers>
        <InvoiceSection />
      </Providers>,
    );

    expect(await screen.findByText(/Neue Rechnung/i)).toBeInTheDocument();

    // ====== AUTOCOMPLETE: Customer data =====
    const inputName = screen.getByLabelText(/Kundenname/i);
    await userEvent.type(inputName, "pet");

    const option = await screen.findByText(/Peter Fischer/i);
    expect(screen.getByText(/Petra Fischmann/i)).toBeInTheDocument();
    await userEvent.click(option);

    expect(screen.getByLabelText(/Strasse/i)).toHaveValue("Fischerstraße");
    expect(screen.getByLabelText(/Hausnummer/i)).toHaveValue("10");
    expect(screen.getByLabelText(/PLZ/i)).toHaveValue("98765");
    expect(screen.getByLabelText(/Ort/i)).toHaveValue("Vienna");
    expect(screen.getByLabelText(/Land/i)).toHaveValue("Österreich");

    // ==== AUTOCOMPLETE: Item ====
    const descInput = screen.getByLabelText(/Warenbeschreibung/i);
    await userEvent.type(descInput, "ware");

    const productOption = await screen.findByText("Hardware");
    expect(screen.getByText(/Software/i)).toBeInTheDocument();
    await userEvent.click(productOption);

    expect(screen.getByLabelText(/Steuersatz/i)).toHaveValue("7");
    expect(screen.getByLabelText(/Preis/i)).toHaveValue(100);

    await userEvent.type(screen.getByLabelText(/Menge/i), "1");

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /speichern/i }));

    // Notification
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Rechnung erstellt!"),
    );
  });
});
