import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import createUrl from "@/lib/createUrl";

export const useUrlState = <T extends string | number | boolean>(
  key: string,
  defaultValue: T,
  debounceTime = 0,
): [
  T,
  (newValue: T, extras?: Record<string, string | number | boolean>) => void,
] => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getParsedValue = useCallback(
    (value: string | null): T => {
      if (value === null) return defaultValue;
      if (typeof defaultValue === "number") return parseInt(value, 10) as T;
      if (typeof defaultValue === "boolean") return (value === "true") as T;
      return value as T;
    },
    [defaultValue],
  );

  const [internalValue, setInternalValue] = useState<T>(() =>
    getParsedValue(searchParams.get(key)),
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const urlValue = getParsedValue(searchParams.get(key));
    setInternalValue(urlValue);
  }, [searchParams, key, getParsedValue]);

  const updateUrl = useCallback(
    (newValue: T, extras?: Record<string, string | number | boolean>) => {
      const newParams = new URLSearchParams(window.location.search);

      if (newValue === defaultValue || newValue === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, String(newValue));
      }

      if (extras) {
        Object.entries(extras).forEach(([k, v]) => {
          if (v === "" || v === null || v === undefined) {
            newParams.delete(k);
          } else {
            newParams.set(k, String(v));
          }
        });
      }

      router.push(createUrl(pathname, newParams), { scroll: false });
    },
    [key, pathname, router, defaultValue],
  );

  const setUrlState = useCallback(
    (newValue: T, extras?: Record<string, string | number | boolean>) => {
      setInternalValue(newValue);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (debounceTime === 0) {
        updateUrl(newValue, extras);
      } else {
        timerRef.current = setTimeout(() => {
          updateUrl(newValue, extras);
        }, debounceTime);
      }
    },
    [debounceTime, updateUrl],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return [internalValue, setUrlState];
};
