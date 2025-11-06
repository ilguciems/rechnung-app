import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./tests/mocks/server";

Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});
afterAll(() => server.close());
