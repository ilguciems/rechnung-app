import { fireEvent, waitFor } from "@testing-library/react";
import { renderWithIntl } from "@/tests/test-utils";
import RefreshVerificationForm from "../components/RefreshVerificationForm";

const pendingResolvers: Array<() => void> = [];

vi.mock("@teispace/next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: unknown }) => children,
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@/lib/auth-client", () => ({
  sendVerificationEmail: vi.fn(
    () =>
      new Promise<void>((resolve) => {
        pendingResolvers.push(resolve);
      }),
  ),
}));

describe("RefreshVerificationForm", () => {
  it("keeps the form disabled until the newest request settles", async () => {
    pendingResolvers.length = 0;

    const { container } = renderWithIntl(
      <RefreshVerificationForm email="user@example.com" />,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const button = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(false);

    fireEvent.submit(form);
    await waitFor(() => expect(pendingResolvers).toHaveLength(1));
    expect(button.disabled).toBe(true);

    fireEvent.submit(form);
    await waitFor(() => expect(pendingResolvers).toHaveLength(2));

    // The older request settling first must not clear the newer one's spinner.
    pendingResolvers[0]();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(button.disabled).toBe(true);

    pendingResolvers[1]();
    await waitFor(() => expect(button.disabled).toBe(false));
  });
});
