"use client";
import { useTimer } from "@/context/TimerContext";
import { useSession } from "@/lib/auth-client";

export function SessionTimerUI() {
  const { timeLeft, resetTimer, WARNING_TIME, isPending, handleLogout } =
    useTimer();
  const { data: session } = useSession();

  const isOpen = timeLeft !== null && timeLeft <= WARNING_TIME && timeLeft > 0;

  if (isPending || !session || !isOpen) return null;

  const progress = (timeLeft / WARNING_TIME) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const onLogoutClick = async () => {
    await handleLogout("manual");
  };

  return (
    <div className="fixed bottom-6 right-6 z-100 w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Die Sitzung läuft ab
          </h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Sie werden nach dieser Zeit automatisch abgemeldet:{" "}
            <span className="font-mono font-bold text-red-600 dark:text-red-400">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={resetTimer}
              className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              Sitzung verlangen
            </button>
            <button
              type="button"
              onClick={onLogoutClick}
              className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Jetzt abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
