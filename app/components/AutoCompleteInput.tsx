/** biome-ignore-all lint/a11y/noNoninteractiveElementToInteractiveRole: <lint-ignore> */
/** biome-ignore-all lint/a11y/useFocusableInteractive: <lint-ignore> */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  type Control,
  type FieldErrors,
  type FieldValues,
  get,
  type Path,
  type PathValue,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";

type AutoCompleteInputProps<T extends FieldValues, K> = {
  name: Path<T>;
  label: string;
  fetchUrl: string;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  onSelect: (item: K) => void;
  displayKey?: keyof K;
  bgWhite?: boolean;
  control: Control<T>;
  className?: string;
};

export default function AutoCompleteInput<
  T extends FieldValues,
  K extends Record<string, unknown>,
>({
  name,
  label,
  fetchUrl,
  register,
  setValue,
  errors,
  placeholder,
  onSelect,
  displayKey,
  control,
  bgWhite = false,
  className = "",
}: AutoCompleteInputProps<T, K>) {
  const watchedValue = useWatch({ control, name });
  const [query, setQuery] = useState(watchedValue ?? "");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const errorMessage = get(errors, name)?.message as string | undefined;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!watchedValue) setQuery("");
  }, [watchedValue]);

  useEffect(() => {
    if (!open) return;
    if (highlightIndex < 0 || !listRef.current) return;

    const el = listRef.current.children[highlightIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  const { data: results = [] } = useQuery({
    queryKey: ["autocomplete", fetchUrl, debouncedQuery],
    queryFn: async () => {
      const res = await fetch(
        `${fetchUrl}&search=${encodeURIComponent(debouncedQuery)}`,
      );
      if (!res.ok) throw new Error("Fehler beim Laden der Daten");
      return res.json() as Promise<K[]>;
    },
    enabled: debouncedQuery.trim().length > 2,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    setHighlightIndex((i) => {
      if (i < 0) return -1;
      if (i >= results.length) return results.length - 1;
      return i;
    });
  }, [results.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: K) => {
    const value = displayKey ? String(item[displayKey]) : String(item);
    setValue(name, value as PathValue<T, Path<T>>, {
      shouldValidate: true,
      shouldDirty: true,
    });
    onSelect(item);
    setQuery(value);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`grid relative ${className ?? ""}`}>
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
        {...register(name)}
        placeholder={placeholder}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open || results.length === 0) return;

          if (e.key === "Tab") {
            setOpen(false);

            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : 0,
            );
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) =>
              prev > 0 ? prev - 1 : results.length - 1,
            );
          }

          if (e.key === "Enter" && highlightIndex >= 0) {
            e.preventDefault();
            handleSelect(results[highlightIndex]);
          }

          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        onFocus={() => query && setOpen(true)}
        className={`border p-2 rounded w-full ${
          errorMessage ? "border-red-500" : "border-gray-300"
        }`}
        aria-autocomplete="list"
        aria-controls={`${name}-listbox`}
        role="combobox"
        aria-expanded={open && results.length > 0}
      />

      {open && results.length > 0 && (
        <ul
          id={`${name}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute z-10 mt-11 w-full bg-gray-100 border border-gray-300 rounded shadow-md max-h-60 overflow-auto text-black text-sm"
        >
          {results.map((item, index) => {
            const { id, ...rest } = item;
            return (
              <li
                key={String(id)}
                id={`${name}-option-${index}`}
                role="option"
                aria-selected={highlightIndex === index}
                onClick={() => handleSelect(item)}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(item)}
                className={`px-3 py-2 cursor-pointer border-b border-gray-800 ${
                  highlightIndex === index ? "bg-blue-200" : "hover:bg-blue-100"
                }`}
              >
                {displayKey === "customerName"
                  ? Object.values(rest).join(", ")
                  : displayKey === "description"
                    ? String(item[displayKey])
                    : JSON.stringify(item)}
              </li>
            );
          })}
        </ul>
      )}
      <p className="h-4 text-xs text-red-500 mt-1">{errorMessage ?? ""}</p>
    </div>
  );
}
