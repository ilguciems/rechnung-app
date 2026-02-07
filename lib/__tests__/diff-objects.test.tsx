import diffObjects from "../diff-objects";

describe("diffObjects", () => {
  it("should return an empty object if the objects are the same", () => {
    const oldObj = { a: "1", b: "2", c: "3" },
      newObj = { a: "1", b: "2", c: "3" },
      diff = diffObjects(oldObj, newObj);
    expect(diff).toEqual({});
  });

  it("should return the difference between the objects", () => {
    const oldObj = { a: "1", b: "2", c: "3" },
      newObj = { a: "1", b: "2", c: "4" },
      diff = diffObjects(oldObj, newObj);
    expect(diff).toEqual({ c: { old: "3", new: "4" } });
  });

  it("should handle null values", () => {
    const oldObj = { a: "1", b: "2", c: null as unknown as string },
      newObj = { a: "1", b: "2", c: "3" as unknown as string },
      diff = diffObjects(oldObj, newObj);
    expect(diff).toEqual({ c: { old: "null", new: "3" } });
  });

  it("should handle boolean values", () => {
    const oldObj = { a: "1", b: "2", c: false as unknown as string },
      newObj = { a: "1", b: "2", c: true as unknown as string },
      diff = diffObjects(oldObj, newObj);
    expect(diff).toEqual({ c: { old: "no", new: "yes" } });
  });
});
