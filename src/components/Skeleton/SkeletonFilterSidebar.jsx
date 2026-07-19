const SkeletonFilterSidebar = () => {
    return (
        <div className="lg:w-1/4 text-gray-800">
            <div className="bg-white diva-rounded border border-gray-200 p-6 sticky top-24 animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>

                {/* Price Range Skeleton */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2">
                                <div className="h-4 w-4 bg-gray-300 rounded-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                        ))}
                    </div>

                    {/* Custom Range Skeleton */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-300 rounded w-4"></div>
                            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Sort By Skeleton */}
                <div className="mb-6">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>

                {/* Reset Button Skeleton */}
                <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
        </div>
    );
};

export default SkeletonFilterSidebar;
