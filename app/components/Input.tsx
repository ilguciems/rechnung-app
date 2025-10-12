import {
  type FieldErrors,
  type FieldValues,
  get,
  type Path,
  type PathValue,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { formatIbanInput } from "@/lib/iban-utils";
import { formatPhone } from "@/lib/phone-utils";

type InputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  className?: string;
  bgWhite?: boolean;
  register: UseFormRegister<T>;
  setValue?: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  type?: "text" | "email" | "iban" | "number" | "password" | "phone";
  placeholder?: string;
  step?: string;
  inputMode?:
    | "text"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal"
    | undefined;
};

export default function Input<T extends FieldValues>({
  name,
  label,
  className,
  register,
  setValue,
  errors,
  type = "text",
  placeholder,
  inputMode = "text",
  step = undefined,
  bgWhite = false,
}: InputProps<T>) {
  const errorMessage = get(errors, name)?.message as string | undefined;

  const { onChange, onBlur, ...rest } = register(name, {
    valueAsNumber: type === "number" || inputMode === "decimal",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (type === "iban" && setValue) {
      const formatted = formatIbanInput(value);
      setValue(name, formatted as PathValue<T, Path<T>>, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }
    onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (type === "phone" && setValue) {
      if (value.trim() !== "") {
        const formatted = formatPhone(value);
        setValue(name, formatted as PathValue<T, Path<T>>, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      return;
    }
    onBlur(e);
  };

  return (
    <div className={`grid relative ${className ?? ""}`}>
      <label
        htmlFor={name}
        className={`text-xs text-gray-700 px-2 absolute -top-2 left-2 ${
          bgWhite ? "bg-white" : "bg-gray-100"
        }`}
      >
        {label}
      </label>

      <input
        id={name}
        type={type === "iban" || type === "phone" ? "text" : type}
        placeholder={placeholder}
        {...rest}
        inputMode={inputMode}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`border p-2 rounded w-full ${
          errorMessage ? "border-red-500" : "border-gray-300"
        }`}
      />
      <p className="h-4 text-xs text-red-500 mt-1">{errorMessage ?? ""}</p>
    </div>
  );
}
