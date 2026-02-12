const THREE_ARRAY = ["t1", "t2", "t3"];
const FOUR_ARRAY = ["f1", "f2", "f3", "f4"];
const SIX_ARRAY = ["s1", "s2", "s3", "s4", "s5", "s6"];
const HEIGHTS = ["40%", "70%", "45%", "80%", "30%", "60%"];

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {THREE_ARRAY.map((key) => (
          <div
            key={key}
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm h-32"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="h-6 w-48 bg-gray-200 rounded mb-8" />
        <div className="h-[350px] w-full bg-gray-50 rounded-xl flex items-end justify-between p-6 gap-4">
          {SIX_ARRAY.map((key) => (
            <div
              key={key}
              className="w-full bg-gray-200 rounded-t-lg"
              style={{ height: HEIGHTS[SIX_ARRAY.indexOf(key)] }}
            />
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        {FOUR_ARRAY.map((key) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0"
          >
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
