import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import AutoCompleteInput from "@/app/components/AutoCompleteInput";
import { ROUTES } from "@/lib/api-routes";
import { renderWithIntl } from "@/tests/test-utils";

type Form = { customerName: string };
type Customer = { id: string; customerName: string };

function Harness({ onSelect }: { onSelect: (item: Customer) => void }) {
  const { register, setValue, control, formState } = useForm<Form>({
    defaultValues: { customerName: "" },
  });

  return (
    <AutoCompleteInput<Form, Customer>
      name="customerName"
      label="Kunde"
      fetchUrl={ROUTES.CUSTOMERS_SEARCH("customers")}
      register={register}
      setValue={setValue}
      control={control}
      errors={formState.errors}
      onSelect={onSelect}
      displayKey="customerName"
    />
  );
}

describe("AutoCompleteInput", () => {
  it("does not commit a selection when Enter confirms an IME candidate", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    const { getByLabelText, findAllByRole } = renderWithIntl(
      <Harness onSelect={onSelect} />,
    );

    const input = getByLabelText("Kunde") as HTMLInputElement;
    await user.type(input, "Petra");

    const options = await findAllByRole("option", undefined, {
      timeout: 5000,
    });
    expect(options.length).toBeGreaterThan(0);

    fireEvent.keyDown(input, { key: "ArrowDown" });

    // Enter while the IME is still composing confirms the candidate, not the row.
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
