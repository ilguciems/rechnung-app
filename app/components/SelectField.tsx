import {
  type FieldErrors,
  type FieldValues,
  get,
  type Path,
  type UseFormRegister,
} from "react-hook-form";

type Option = {
  label: string;
  value: string | number;
};

type SelectFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  className?: string;
  bgWhite?: boolean;
  register: UseFormRegister<T>;
  setValueAs?: (v: string) => number | null;
  errors: FieldErrors<T>;
  options: Option[];
};

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  register,
  errors,
  setValueAs,
  bgWhite = false,
  className = "",
  ...props
}: SelectFieldProps<T>) {
  const errorMessage = get(errors, name)?.message as string | undefined;

  return (
    <div className={`grid relative ${className ?? ""}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-xs text-gray-700 px-2 absolute -top-2 left-2 ${
            bgWhite ? "bg-white" : "bg-gray-100"
          }`}
        >
          {label}
        </label>
      )}

      <select
        id={name}
        {...register(name, setValueAs ? { setValueAs } : {})}
        className={`border p-2 rounded w-full ${
          errorMessage ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <p className="h-4 text-xs text-red-500 mt-1">{errorMessage ?? ""}</p>
    </div>
  );
}
