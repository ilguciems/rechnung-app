export default function InvoicesSkeleton() {
  return (
    <li
      className="flex items-center justify-between border p-3 rounded bg-white animate-pulse"
      aria-hidden="true"
    >
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-36 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-56 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="flex w-20 justify-end">
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    </li>
  );
}

export const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];
