import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendUpdate = async () => {
        const cookieStore = await cookies();
        const timerCookie = cookieStore.get("timer-expires-at")?.value;

        if (!timerCookie) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ timeLeft: null })}\n\n`),
          );
          return;
        }

        const expiresAt = parseInt(timerCookie, 10);
        const now = Date.now();
        const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ timeLeft })}\n\n`),
        );
      };

      const interval = setInterval(sendUpdate, 1000);
      await sendUpdate();

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
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
