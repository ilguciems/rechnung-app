"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Hoppla! Verbindungsproblem.
      </h2>
      <p className="text-gray-600 mb-6">
        Die Datenbank scheint nicht zu reagieren. Überprüfen Sie, ob der
        Docker-Container ausgeführt wird. Fehlerbeschreibung: {error.message}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded-md"
      >
        Versuchen Sie es erneut
      </button>
    </div>
  );
}
