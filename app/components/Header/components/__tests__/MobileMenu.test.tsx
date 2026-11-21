import { fireEvent } from "@testing-library/react";
import { renderWithIntl } from "@/tests/test-utils";
import { MobileMenu } from "../MobileMenu";
import { NavLink } from "../NavLink";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/profile/user-1",
}));

describe("MobileMenu", () => {
  it("closes the panel when a navigation item is clicked", () => {
    const { getByRole, queryByRole } = renderWithIntl(
      <MobileMenu>
        <NavLink href="/" text="Rechnungen" title="Rechnungen" />
      </MobileMenu>,
    );

    expect(queryByRole("navigation")).toBeNull();

    fireEvent.click(getByRole("button", { name: "Menü öffnen" }));

    expect(getByRole("navigation")).toBeInTheDocument();
    expect(getByRole("button", { expanded: true })).toHaveAccessibleName(
      "Menü schließen",
    );

    fireEvent.click(getByRole("link", { name: "Rechnungen" }));

    expect(queryByRole("navigation")).toBeNull();
    expect(getByRole("button", { expanded: false })).toHaveAccessibleName(
      "Menü öffnen",
    );
  });
});
