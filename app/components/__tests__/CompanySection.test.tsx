import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Providers from "../../providers";
import CompanySection from "../CompanySection";

describe("CompanySection", () => {
  it("should fill out the new company form", async () => {
    render(
      <Providers>
        <CompanySection />
      </Providers>,
    );

    expect(screen.getByText("Firmendaten eingeben")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Firmenname");
    expect(nameInput).toBeInTheDocument();
    await userEvent.type(nameInput, "Test Company");
    expect(nameInput).toHaveValue("Test Company");

    const legalFormInput = screen.getByLabelText("Rechtsform");
    expect(legalFormInput).toBeInTheDocument();
    expect(legalFormInput).toHaveValue("KLEINGEWERBE");
    await userEvent.selectOptions(legalFormInput, "Freiberufler");
    expect(legalFormInput).toHaveValue("FREIBERUFLER");

    const streetInput = screen.getByLabelText("Straße");
    expect(streetInput).toBeInTheDocument();
    await userEvent.type(streetInput, "Test Street");
    expect(streetInput).toHaveValue("Test Street");

    const houseNumberInput = screen.getByLabelText("Hausnummer");
    expect(houseNumberInput).toBeInTheDocument();
    await userEvent.type(houseNumberInput, "123");
    expect(houseNumberInput).toHaveValue("123");

    const zipCodeInput = screen.getByLabelText("PLZ");
    expect(zipCodeInput).toBeInTheDocument();
    await userEvent.type(zipCodeInput, "12345");
    expect(zipCodeInput).toHaveValue("12345");

    const cityInput = screen.getByLabelText("Ort");
    expect(cityInput).toBeInTheDocument();
    await userEvent.type(cityInput, "Test City");
    expect(cityInput).toHaveValue("Test City");

    const countryInput = screen.getByLabelText("Land");
    expect(countryInput).toBeInTheDocument();

    expect(countryInput).toHaveValue("Deutschland");

    const phoneInput = screen.getByLabelText("Telefon");
    expect(phoneInput).toBeInTheDocument();
    await userEvent.type(phoneInput, "01234567890");
    // Simulate onBlur
    await userEvent.click(screen.getByText("Firmendaten eingeben"));
    expect(phoneInput).toHaveValue("+49 123 4567 890");

    const emailInput = screen.getByLabelText("E-Mail");
    expect(emailInput).toBeInTheDocument();
    await userEvent.type(emailInput, "0mO7K@example.com");
    expect(emailInput).toHaveValue("0mO7K@example.com");

    const ibanInput = screen.getByLabelText("IBAN");
    expect(ibanInput).toBeInTheDocument();
    await userEvent.type(ibanInput, "DE12345678901234567890");
    expect(ibanInput).toHaveValue("DE12 3456 7890 1234 5678 90");

    const bicInput = screen.getByLabelText("BIC");
    expect(bicInput).toBeInTheDocument();
    await userEvent.type(bicInput, "DE123456789");
    expect(bicInput).toHaveValue("DE123456789");

    const taxNumberInput = screen.getByLabelText("Steuernummer *");
    expect(taxNumberInput).toBeInTheDocument();
    await userEvent.type(taxNumberInput, "DE123456789");
    expect(taxNumberInput).toHaveValue("DE123456789");

    const vatInput = screen.getByLabelText(
      "Umsatzsteuer-Identifikationsnummer *",
    );
    expect(vatInput).toBeInTheDocument();
    await userEvent.type(vatInput, "DE123456789");
    expect(vatInput).toHaveValue("DE123456789");

    expect(
      screen.getByText("Mein Unternehmen ist umsatzsteuerpflichtig."),
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();

    expect(checkbox).not.toBeChecked();

    expect(
      screen.queryByText("Erster Steuersatz in %"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Zweiter Steuersatz in %"),
    ).not.toBeInTheDocument();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    expect(screen.getByText("Erster Steuersatz in %")).toBeInTheDocument();
    expect(screen.getByText("Zweiter Steuersatz in %")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "Speichern" });
    expect(submitButton).toBeEnabled();
  });

  it("shows tax rates for vat required legal forms on load", async () => {
    render(
      <Providers>
        <CompanySection />
      </Providers>,
    );
    expect(screen.getByText("Firmendaten eingeben")).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();

    expect(checkbox).not.toBeChecked();

    const legalFormInput = screen.getByLabelText("Rechtsform");
    expect(legalFormInput).toBeInTheDocument();
    expect(legalFormInput).toHaveValue("KLEINGEWERBE");

    expect(
      screen.queryByText("Erster Steuersatz in %"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Zweiter Steuersatz in %"),
    ).not.toBeInTheDocument();

    await userEvent.selectOptions(legalFormInput, "GmbH");
    expect(legalFormInput).toHaveValue("GMBH");

    expect(checkbox).toBeChecked();
    expect(screen.getByText("Erster Steuersatz in %")).toBeInTheDocument();
    expect(screen.getByText("Zweiter Steuersatz in %")).toBeInTheDocument();
  });
});
