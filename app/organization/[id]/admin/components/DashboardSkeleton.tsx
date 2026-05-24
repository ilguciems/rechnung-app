const TOP_FOUR_ARRAY = ["t1", "t2", "t3", "t4"];
const FOUR_ARRAY = ["f1", "f2", "f3", "f4"];
const SIX_ARRAY = ["s1", "s2", "s3", "s4", "s5", "s6"];
const HEIGHTS = ["40%", "70%", "45%", "80%", "30%", "60%"];

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOP_FOUR_ARRAY.map((key) => (
          <div
            key={key}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-32"
          >
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
        <div className="h-87.5 w-full bg-gray-50 dark:bg-gray-900 rounded-xl flex items-end justify-between p-6 gap-4">
          {SIX_ARRAY.map((key) => (
            <div
              key={key}
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg"
              style={{ height: HEIGHTS[SIX_ARRAY.indexOf(key)] }}
            />
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {FOUR_ARRAY.map((key) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-gray-600 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 dark:bg-gray-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
