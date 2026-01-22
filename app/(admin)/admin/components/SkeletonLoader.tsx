const SkeletonLoader = () => {
  return (
    <li className="grid grid-cols-6 gap-4 p-4 items-center animate-pulse border-b border-gray-100 last:border-b-0">
      <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1 items-end sm:items-start">
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="col-span-4 sm:col-span-2 flex flex-col gap-1">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="col-span-2 sm:col-span-1 flex justify-end gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
    </li>
  );
};

export default SkeletonLoader;
