import { fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/tests/test-utils";
import Logs from "../Logs";

const log = (id: string) => ({
  id,
  createdAt: "2026-02-01T10:00:00.000Z",
  action: "CREATE",
  entityType: "INVOICE",
  entityId: 1,
  metadata: { type: "invoice", invoiceNumber: `INV-${id}` },
  user: { id: "user-1", name: `Ada ${id}`, email: "ada@example.com" },
});

const page = (data: unknown[], nextCursor: string | null) =>
  new Response(JSON.stringify({ data, nextCursor }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("Logs", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = typeof input === "string" ? input : input.toString();

      return Promise.resolve(
        url.includes("cursor=")
          ? page([log("2")], null)
          : page([log("1")], "2026-02-01T10:00:00.000Z|log-1"),
      );
    });
  });

  it("appends the next page and hides the button at the end", async () => {
    const { findByText, getByRole, queryByRole, queryByText } =
      renderWithIntl(<Logs />);

    await findByText(/Ada 1/);
    expect(queryByText(/Ada 2/)).toBeNull();

    fireEvent.click(getByRole("button", { name: "Mehr laden" }));

    await findByText(/Ada 2/);
    expect(queryByRole("button", { name: "Mehr laden" })).toBeNull();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
