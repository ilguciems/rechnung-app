import { act, render, screen } from "@testing-library/react";
import { TimerProvider, useTimer } from "@/context/TimerContext";

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

let consumerRenders = 0;

function TimerConsumer() {
  useTimer();
  consumerRenders += 1;
  return null;
}

describe("TimerProvider", () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    consumerRenders = 0;
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

  it("keeps the context value stable when only the stream reconnects", () => {
    render(
      <TimerProvider>
        <TimerConsumer />
      </TimerProvider>,
    );

    const rendersAfterMount = consumerRenders;

    act(() => {
      window.dispatchEvent(new Event("focus"));
    });

    expect(FakeEventSource.instances).toHaveLength(2);
    expect(consumerRenders).toBe(rendersAfterMount);
  });
});
