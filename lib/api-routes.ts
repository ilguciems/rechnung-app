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

  // ORGANIZATION: "/api/organization",

  INVITE_ORGANIZATION: "/api/organization/invite",
  INVITE_ORGANIZATION_ACCEPT: "/api/organization/invite/accept",
  ORGANIZATION_NAME: "/api/organization/name",
  ORGANIZATION_MEMBERSHIP_MY: "/api/organization/membership/my",
  ORGANIZATION_LOGS: "/api/organization/logs",
  ORGANIZATION_MEMBERSHIP: "/api/organization/membership",
  ORGANIZATION_PENDING_INVITATIONS: "/api/organization/invite/pending",
};
