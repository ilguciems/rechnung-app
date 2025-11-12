export default function InvoicesSkeleton() {
  return (
    <li
      className="flex items-center justify-between border p-3 rounded bg-white animate-pulse"
      aria-hidden="true"
    >
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 ml-4 w-40">
        <div className="h-8 bg-gray-300 rounded w-full"></div>
        <div className="h-8 bg-gray-300 rounded w-full"></div>
      </div>
    </li>
  );
}

export const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5"];
