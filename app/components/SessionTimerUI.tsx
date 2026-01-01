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
    <div className="fixed bottom-6 right-6 z-[100] w-80 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="h-1.5 w-full bg-gray-100">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-lg">
            Die Sitzung läuft ab
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Sie werden nach dieser Zeit automatisch abgemeldet:{" "}
            <span className="font-mono font-bold text-red-600">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={resetTimer}
              className="py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer bg-black text-white hover:bg-gray-800"
            >
              Sitzung verlangen
            </button>
            <button
              type="button"
              onClick={onLogoutClick}
              className="py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200 cursor-pointer bg-gray-100 text-gray-900 hover:bg-gray-200"
            >
              Jetzt abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
