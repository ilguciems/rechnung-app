import { act, render, screen } from "@testing-library/react";
import { TimerProvider } from "@/context/TimerContext";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/lib/auth-client", () => ({
  useSession: () => ({ data: { user: { id: "u1" } }, isPending: false }),
  signOut: vi.fn(),
}));

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  closed = false;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

describe("TimerProvider", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens one connection, replaces it on focus and closes it on unmount", () => {
    const { unmount } = render(
      <TimerProvider>
        <span>child</span>
      </TimerProvider>,
    );

    expect(screen.getByText("child")).toBeInTheDocument();
    expect(FakeEventSource.instances).toHaveLength(1);

    const first = FakeEventSource.instances[0];
    expect(first.closed).toBe(false);
    expect(first.url).toContain("/api/timer/sse");

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(FakeEventSource.instances).toHaveLength(2);
    expect(first.closed).toBe(true);

    const second = FakeEventSource.instances[1];
    expect(second.closed).toBe(false);

    unmount();

    expect(second.closed).toBe(true);
  });
});
