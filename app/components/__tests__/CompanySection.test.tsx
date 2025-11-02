import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import type { Mock } from "vitest";
import Providers from "../../providers";
import CompanySection from "../CompanySection";

// mock toast
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
}));

// mock fetch response

beforeEach(() => {
  global.fetch = vi.fn((url, opts) => {
    if (url === "/api/company" && opts.method === "GET") {
      return Promise.resolve({
        ok: true,
      });
    }

    if (url === "/api/company" && opts.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          name: "Test Company",
          message: "success",
        }),
      });
    }

    return Promise.reject(new Error("Unknown fetch URL"));
  }) as Mock;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CompanySection", () => {
  const user = userEvent.setup();
  it("should fill out the new company form and submit", async () => {
    render(
      <Providers>
        <CompanySection />
      </Providers>,
    );

    expect(screen.getByText("Firmendaten eingeben")).toBeInTheDocument();
    expect(
      screen.queryByText("Firmendaten bearbeiten"),
    ).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText("Firmenname");
    expect(nameInput).toBeInTheDocument();
    await user.type(nameInput, "Test Company");

    const legalFormInput = screen.getByLabelText("Rechtsform");
    expect(legalFormInput).toBeInTheDocument();
    expect(legalFormInput).toHaveValue("KLEINGEWERBE");

    expect(
      screen.queryByText("Diese Rechtsform ist umsatzsteuerpflichtig."),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Mein Unternehmen ist umsatzsteuerpflichtig."),
    ).toBeInTheDocument();

    await user.selectOptions(legalFormInput, "GMBH");
    expect(legalFormInput).toHaveValue("GMBH");

    expect(
      screen.queryByText("Mein Unternehmen ist umsatzsteuerpflichtig."),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Diese Rechtsform ist umsatzsteuerpflichtig."),
    ).toBeInTheDocument();

    const streetInput = screen.getByLabelText("Straße");
    expect(streetInput).toBeInTheDocument();
    await user.type(streetInput, "Test Street");

    const houseNumberInput = screen.getByLabelText("Hausnummer");
    expect(houseNumberInput).toBeInTheDocument();
    await user.type(houseNumberInput, "123");

    const zipCodeInput = screen.getByLabelText("PLZ");
    expect(zipCodeInput).toBeInTheDocument();
    await user.type(zipCodeInput, "12345");

    const cityInput = screen.getByLabelText("Ort");
    expect(cityInput).toBeInTheDocument();
    await user.type(cityInput, "Test City");

    const countryInput = screen.getByLabelText("Land");
    expect(countryInput).toBeInTheDocument();

    expect(countryInput).toHaveValue("Deutschland");

    const phoneInput = screen.getByLabelText("Telefon");
    expect(phoneInput).toBeInTheDocument();
    await user.type(phoneInput, "01234567890");

    // Simulate onBlur
    await user.click(screen.getByText("Firmendaten eingeben"));
    expect(phoneInput).toHaveValue("+49 123 4567 890");

    const emailInput = screen.getByLabelText("E-Mail");
    expect(emailInput).toBeInTheDocument();
    await user.type(emailInput, "0mO7K@example.com");

    const bankInput = screen.getByLabelText("Bank");
    expect(bankInput).toBeInTheDocument();
    await user.type(bankInput, "Sparkasse");

    const ibanInput = screen.getByLabelText("IBAN");
    expect(ibanInput).toBeInTheDocument();
    await user.type(ibanInput, "DE56510200007515835538");
    expect(ibanInput).toHaveValue("DE56 5102 0000 7515 8355 38");

    const bicInput = screen.getByLabelText("BIC");
    expect(bicInput).toBeInTheDocument();
    await user.type(bicInput, "BHFBDEFF500");

    const handelsregisternummerInput = screen.getByLabelText(
      "Handelsregisternummer",
    );
    expect(handelsregisternummerInput).toBeInTheDocument();
    await user.type(handelsregisternummerInput, "123456789");

    const taxNumberInput = screen.getByLabelText("Steuernummer *");
    expect(taxNumberInput).toBeInTheDocument();
    await user.type(taxNumberInput, "DE123456789");

    const vatInput = screen.getByLabelText(
      "Umsatzsteuer-Identifikationsnummer *",
    );
    expect(vatInput).toBeInTheDocument();
    await user.type(vatInput, "DE123456789");

    expect(
      screen.getByText("Diese Rechtsform ist umsatzsteuerpflichtig."),
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();

    expect(checkbox).toBeDisabled();

    expect(screen.queryByText("Erster Steuersatz in %")).toBeInTheDocument();
    expect(screen.queryByText("Zweiter Steuersatz in %")).toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    expect(screen.getByText("Erster Steuersatz in %")).toBeInTheDocument();
    expect(screen.getByText("Zweiter Steuersatz in %")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /speichern/i });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

// API was called

const fetchCalls = (global.fetch as Mock).mock.calls;

// Find the POST call
const postCall = fetchCalls.find(
  (call) => call[0] === "/api/company" && call[1]?.method === "POST"
);

// Check that the POST call was made
expect((postCall ?? [])[1]).toEqual(
  expect.objectContaining({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: expect.any(String),
  })
);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Unternehmensdaten gespeichert!",
      ),
    );

    expect(screen.getByText("Firmendaten bearbeiten")).toBeInTheDocument();
    expect(screen.queryByText("Firmendaten eingeben")).not.toBeInTheDocument();
  });
});
