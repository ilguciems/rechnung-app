import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";
import Providers from "../../providers";
import InvoicesListSection from "../InvoicesListSection";

// mock URL for PDF download
global.URL.createObjectURL = vi.fn(() => "blob:mock");
global.URL.revokeObjectURL = vi.fn();

// avoid JSDOM navigation crash
window.open = vi.fn();
// biome-ignore lint/suspicious/noExplicitAny: <tobefixed>
delete (window as any).location;
// biome-ignore lint/suspicious/noExplicitAny: <tobefixed>
window.location = { assign: vi.fn(), href: "" } as any;
HTMLAnchorElement.prototype.click = vi.fn();

// mock fetch responses
global.fetch = vi.fn((url, opts) => {
  if (url === "/api/invoices?" && (!opts || opts.method === "GET")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            invoiceNumber: "INV-123",
            customerName: "John Doe",
            createdAt: "2022-01-01T00:00:00.000Z",
            isPaid: false,
            items: [{ quantity: 1, unitPrice: 100 }],
          },
        ]),
    });
  }

  if (url === "/api/invoices/1/pdf" && (!opts || opts.method === "GET")) {
    return Promise.resolve({
      ok: true,
      blob: () => Promise.resolve(new Blob(["PDF"])),
    });
  }

  return Promise.reject(new Error("Unknown fetch URL"));
}) as Mock;

describe("InvoicesListSection", () => {
  const user = userEvent.setup();
  it("renders invoice", async () => {
    render(
      <Providers>
        <InvoicesListSection />
      </Providers>,
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/invoices?"),
    );

    expect(
      await screen.findByText("Gespeicherte Rechnungen"),
    ).toBeInTheDocument();
    expect(await screen.findByText("INV-123")).toBeInTheDocument();

    expect(await screen.findByText("Offen")).toBeInTheDocument();

    await user.click(screen.getByText("Bezahlt setzen"));

    expect(await screen.findByText("Bezahlt")).toBeInTheDocument();

    await user.click(screen.getByText("PDF herunterladen"));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/invoices/1/pdf"),
    );
  });
});
