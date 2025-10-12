export default function StartLoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center opacity-75">
        <svg
          role="img"
          aria-label="Lade Unternehmensdaten"
          className="animate-spin h-8 w-8 text-blue-600 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <p className="text-gray-700 font-medium">Lade Unternehmensdaten...</p>
        <p className="text-sm text-gray-500">
          Bitte warten, dies kann einige Sekunden dauern.
        </p>
      </div>
    </div>
  );
}
