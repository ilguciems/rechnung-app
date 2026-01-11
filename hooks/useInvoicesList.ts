// hooks/useInvoicesList.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/lib/api-routes";

const PER_PAGE = 5;

export function useInvoicesList() {
  const [search, setSearch] = useState("");
  const [isPaid, setIsPaid] = useState<string>(""); // "", "true", "false"
  const [page, setPage] = useState(1);

  // Debounce search
  const debouncedSearch = useMemo(
    () =>
      _.debounce((val: string) => {
        setSearch(val);
      }, 500),
    [],
  );

  // Reset page on filters
  useEffect(() => {
    const filterApplied =
      (search && search.trim() !== "") ||
      isPaid === "true" ||
      isPaid === "false" ||
      isPaid === "";

    if (filterApplied) {
      setPage(1);
    }
  }, [search, isPaid]);

  const query = useQuery({
    queryKey: ["invoices", search, isPaid, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (isPaid) params.set("isPaid", isPaid);
      params.set("page", String(page));
      params.set("pageSize", PER_PAGE.toString());

      const res = await fetch(ROUTES.INVOICES_SEARCH(params));
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Fehler beim Laden");
      }

      return res.json();
    },
  });

  return {
    search,
    setSearchDebounced: debouncedSearch,
    isPaid,
    setIsPaid,
    page,
    setPage,
    query,
  };
}
