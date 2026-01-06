import {
  type FieldErrors,
  type FieldValues,
  get,
  type Path,
  type UseFormRegister,
} from "react-hook-form";

type OutputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  className?: string;
  bgWhite?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  customError?: string;
};

export default function Output<T extends FieldValues>({
  name,
  label,
  className,
  register,
  bgWhite,
  errors,
  customError = "",
}: OutputProps<T>) {
  const errorMessage = get(errors, name)?.message as string | undefined;
  return (
    <div className={`grid relative ${className ?? ""}`}>
      <label
        htmlFor={name}
        className={`text-xs text-gray-700 px-2 absolute -top-2 left-2 z-10 ${
          bgWhite ? "bg-white" : "bg-gray-100"
        }`}
      >
        {label}
      </label>
      <output
        id={name}
        {...register(name)}
        className={`border p-2 rounded w-full min min-h-[2.5rem]`}
      />
      <p className="h-4 text-xs text-red-500 mt-1">
        {errorMessage ?? customError}
      </p>
    </div>
  );
}
