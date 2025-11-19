export default function StartLoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[100]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]"></span>
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]"></span>
          <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]"></span>
        </div>
        <p aria-live="polite" className="text-gray-700 font-medium">
          Lade Unternehmensdaten
        </p>
        <p className="text-sm text-gray-500 animate-pulse">
          Bitte warten, dies kann einige Sekunden dauern.
        </p>
      </div>
    </div>
  );
}
