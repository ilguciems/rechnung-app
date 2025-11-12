import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/api-routes";
import { server } from "@/tests/mocks/server";
import Providers from "../../providers";
import CompanySection from "../CompanySection";

// mock toast
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  success: vi.fn(),
  error: vi.fn(),
}));

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("CompanySection", () => {
  const user = userEvent.setup();
  it("should fill out the new company form and submit", async () => {
    server.use(
      // mock company not found
      http.get(ROUTES.COMPANY, () => new HttpResponse(null, { status: 200 })),
    );

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

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Unternehmensdaten gespeichert!",
      ),
    );

    expect(screen.getByText("Firmendaten bearbeiten")).toBeInTheDocument();
    expect(screen.queryByText("Firmendaten eingeben")).not.toBeInTheDocument();
  });
  it("renders existing company", async () => {
    // original mock with company data
    server.resetHandlers();
    render(
      <Providers>
        <CompanySection />
      </Providers>,
    );

    expect(
      await screen.findByText("Firmendaten bearbeiten"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Firmendaten eingeben")).not.toBeInTheDocument();

    const nameInput = screen.getByLabelText("Firmenname");
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue("Test Company");

    const legalFormInput = screen.getByLabelText("Rechtsform");
    expect(legalFormInput).toBeInTheDocument();
    expect(legalFormInput).toHaveValue("GMBH");

    const streetInput = screen.getByLabelText("Straße");
    expect(streetInput).toBeInTheDocument();
    expect(streetInput).toHaveValue("Teststraße");

    const zipCodeInput = screen.getByLabelText("PLZ");
    expect(zipCodeInput).toBeInTheDocument();
    expect(zipCodeInput).toHaveValue("12345");

    const cityInput = screen.getByLabelText("Ort");
    expect(cityInput).toBeInTheDocument();
    expect(cityInput).toHaveValue("Test City");

    const countryInput = screen.getByLabelText("Land");
    expect(countryInput).toBeInTheDocument();
    expect(countryInput).toHaveValue("Deutschland");
  });
});
