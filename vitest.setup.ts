import "@testing-library/jest-dom";

Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
