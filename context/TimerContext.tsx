"use client";
import { usePathname } from "next/navigation";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { signOut, useSession } from "@/lib/auth-client";

interface TimerContextType {
  timeLeft: number | null;
  isPending: boolean;
  resetTimer: () => Promise<void>;
  WARNING_TIME: number;
  handleLogout: (reason?: "expired" | "manual") => Promise<void>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const WARNING_TIME = 300; // 5 min

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerVersion, setTimerVersion] = useState(0);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  const isPendingRef = useRef(isPending);
  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  const handleLogout = useCallback(
    async (reason: "expired" | "manual" = "expired") => {
      const bc = new BroadcastChannel("invoice-app");
      bc.postMessage({ type: "LOGOUT" });
      bc.close();

      const currentPath = window.location.pathname + window.location.search;
      await signOut();

      try {
        await fetch("/api/timer/clear", { method: "POST" });
      } catch (e) {
        console.error(e);
      }

      const url =
        reason === "expired"
          ? `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}&reason=session_expired`
          : `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`;

      window.location.href = url;
    },
    [],
  );

  const resetTimer = useCallback(async () => {
    const res = await fetch("/api/timer/reset", { method: "POST" });
    if (res.ok) setTimerVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isPending || !session || pathname === "/sign-in") {
      setTimeLeft(null);
      return;
    }

    const eventSource = new EventSource(
      `/api/timer/sse?v=${timerVersion}&t=${Date.now()}`,
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const serverTime = data.timeLeft;

      if (serverTime === null) {
        if (session) resetTimer();
        setTimeLeft(null);
        return;
      }

      setTimeLeft(serverTime);

      if (serverTime <= 0) {
        eventSource.close();
        handleLogout();
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    const handleFocus = () => {
      console.log("Window focused, syncing timer...");
      setTimerVersion((prev) => prev + 1);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      eventSource.close();
    };
  }, [session, isPending, timerVersion, pathname, handleLogout, resetTimer]);

  // Without a stable identity every consumer re-renders on each provider
  // render, including the stream reconnects triggered by a window focus.
  const value = useMemo(
    () => ({ timeLeft, isPending, resetTimer, WARNING_TIME, handleLogout }),
    [timeLeft, isPending, resetTimer, handleLogout],
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
};
