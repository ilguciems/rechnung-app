export const ROUTES = {
  COMPANY: "/api/company",
  COMPANY_LOGO: "/api/company/logo",

  INVOICES: "/api/invoices",
  INVOICES_LAST: "/api/invoices/last",
  INVOICES_SEARCH: (params: URLSearchParams) =>
    `/api/invoices?${params.toString()}`,
  INVOICE: (id: string) => `/api/invoices/${id}`,
  INVOICE_PDF: (id: string) => `/api/invoices/${id}/pdf-invoice`,
  REMINDER_PDF: (id: string) => `/api/invoices/${id}/payment-reminder`,
  INVOICE_SEND_EMAIL: (invoiceId: string) =>
    `/api/invoices/${invoiceId}/send-invoice`,
  INVOICE_SEND_REMINDER_EMAIL: (invoiceId: string, level?: number) =>
    `/api/invoices/${invoiceId}/send-reminder?level=${level}`,

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
  ORGANIZATION_CONFIG_MAIL: "/api/organization/config/mail",
  ORGANIZATION_MAIL_STATUS: "/api/organization/config/mail/status",
};
