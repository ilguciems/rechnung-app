import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let timeoutId: NodeJS.Timeout;

      const sendUpdate = async () => {
        const cookieStore = await cookies();
        const timerCookie = cookieStore.get("timer-expires-at")?.value;

        if (!timerCookie) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ timeLeft: null })}\n\n`),
          );
          return 1000;
        }

        const expiresAt = parseInt(timerCookie, 10);
        const timeLeft = Math.max(
          0,
          Math.floor((expiresAt - Date.now()) / 1000),
        );

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ timeLeft })}\n\n`),
        );

        return timeLeft > 360 ? 30000 : 1000;
      };

      const run = async () => {
        try {
          const nextTick = await sendUpdate();
          timeoutId = setTimeout(run, nextTick);
        } catch (e) {
          controller.error(e);
        }
      };

      run();

      req.signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
