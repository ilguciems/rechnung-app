import { fireEvent, render, screen } from "@testing-library/react";
import ImageWithFallback from "@/app/components/UploadLogoSection/ImageWithFallback";

const fallback = "/assets/noimage.png";

describe("ImageWithFallback", () => {
  it("swaps to the placeholder when the image fails to load", () => {
    render(
      <ImageWithFallback
        key="/assets/logo.png"
        src="/assets/logo.png"
        fallBackSrc={fallback}
        alt="Logo"
      />,
    );

    const image = screen.getByAltText("Logo");
    expect(image.getAttribute("src")).toContain("logo.png");

    fireEvent.error(image);

    expect(screen.getByAltText("Logo").getAttribute("src")).toContain(
      "noimage.png",
    );
  });

  it("clears the error state when src changes through the key", () => {
    const { rerender } = render(
      <ImageWithFallback
        key="/assets/logo.png"
        src="/assets/logo.png"
        fallBackSrc={fallback}
        alt="Logo"
      />,
    );

    fireEvent.error(screen.getByAltText("Logo"));
    expect(screen.getByAltText("Logo").getAttribute("src")).toContain(
      "noimage.png",
    );

    rerender(
      <ImageWithFallback
        key="/assets/logo-v2.png"
        src="/assets/logo-v2.png"
        fallBackSrc={fallback}
        alt="Logo"
      />,
    );

    expect(screen.getByAltText("Logo").getAttribute("src")).toContain(
      "logo-v2.png",
    );
  });
});
