const SkeletonProductCard = () => (
    <div className="overflow-hidden flex flex-col relative  bg-white h-full animate-pulse">
        {/* Discount Badge Skeleton */}
        <div className="absolute top-4 left-4 w-16 h-6 bg-gray-300 rounded-full"></div>

        {/* Image Skeleton */}
        <div className="relative">
            <div className="relative h-96 w-full bg-gray-300"></div>
        </div>

        {/* Content Skeleton */}
        <div className="p-4 flex flex-col flex-grow">
            <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>

            {/* <div className="mt-auto">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div> */}
        </div>
    </div>
);

export default SkeletonProductCard;