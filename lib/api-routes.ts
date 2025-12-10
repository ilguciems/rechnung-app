export const ROUTES = {
  COMPANY: "/api/company",
  INVOICES: "/api/invoices",
  INVOICES_LAST: "/api/invoices/last",
  INVOICES_SEARCH: (params: URLSearchParams) =>
    `/api/invoices?${params.toString()}`,
  INVOICE: (id: number) => `/api/invoices/${id}`,
  INVOICE_PDF: (id: number) => `/api/invoices/${id}/pdf-invoice`,
  REMINDER_PDF: (id: number) => `/api/invoices/${id}/payment-reminder`,
  COMPANY_LOGO: "/api/company/logo",
  CUSTOMERS_SEARCH: (type: string) =>
    `/api/customers/search?${type === "customers" ? "type=customers" : type === "products" ? "type=products" : ""}`,
};
