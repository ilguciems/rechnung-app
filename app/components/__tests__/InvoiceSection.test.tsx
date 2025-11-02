import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import type { Mock } from "vitest";
import Providers from "../../providers";
import InvoiceSection from "../InvoiceSection";

// mock toast
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
}));

// mock fetch responses
global.fetch = vi.fn((url, _opts) => {
  if (url === "/api/company") {
    return Promise.resolve({
      ok: true,
      json: async () => ({
        isSubjectToVAT: true,
        firstTaxRate: 19,
        secondTaxRate: 7,
      }),
    });
  }

  if (url === "/api/invoices") {
    return Promise.resolve({
      ok: true,
      json: async () => ({ id: 1 }),
    });
  }

  return Promise.reject(new Error("Unknown fetch URL"));
}) as Mock;

describe("InvoiceSection", () => {
  it("creates invoice successfully", async () => {
    render(
      <Providers>
        <InvoiceSection />
      </Providers>,
    );

    // wait loading company finished
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/company"),
    );

    // wait for scroll
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );

    await waitFor(() =>
      expect(screen.getByText(/Neue Rechnung/i)).toBeInTheDocument(),
    );

    // fill customer form
    await userEvent.type(
      screen.getByLabelText(/Kundenname/i),
      "Max Mustermann",
    );
    await userEvent.type(screen.getByLabelText(/Strasse/i), "Teststrasse");
    await userEvent.type(screen.getByLabelText(/Hausnummer/i), "99");
    await userEvent.type(screen.getByLabelText(/PLZ/i), "12345");
    await userEvent.type(screen.getByLabelText(/Ort/i), "Berlin");

    // add item
    await userEvent.type(
      screen.getByLabelText(/Warenbeschreibung/i),
      "Service",
    );
    await userEvent.type(screen.getByLabelText(/Menge/i), "1");
    await userEvent.selectOptions(screen.getByLabelText(/Steuersatz/i), "19");
    await userEvent.type(screen.getByLabelText(/Preis/i), "100");

    // submit
    await userEvent.click(screen.getByRole("button", { name: /speichern/i }));

    // API was called
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const secondCallArgs = (global.fetch as Mock).mock.calls[1];

    expect(secondCallArgs[0]).toBe("/api/invoices");
    expect(secondCallArgs[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.any(String),
      }),
    );

    // toast called
    expect(toast.success).toHaveBeenCalledWith("Rechnung erstellt!");
  });
});
