import { createUrl } from "../createUrl";

describe("createUrl", () => {
  it("should create a URL with query parameters", () => {
    const url = createUrl("/path", new URLSearchParams({ a: "1", b: "2" }));
    expect(url).toBe("/path?a=1&b=2");
  });
});
