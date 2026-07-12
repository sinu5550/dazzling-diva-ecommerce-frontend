"use client";

const CategorySkeletonLoading = ({ itemsCount = 7 }) => {
    const skeletonItems = Array(itemsCount).fill(null);

    return (
        <div className="overflow-hidden px-2">
            <div className="flex">
                {skeletonItems.map((_, index) => (
                    <div
                        key={`skeleton-${index}`}
                        className="flex-shrink-0 px-2 animate-pulse"
                        style={{ width: `${100 / itemsCount}%` }}
                    >
                        <div className="group flex flex-col items-center">
                            <div
                                className="bg-gray-200 h-[280px] md:h-[360px] xl:h-[420px] overflow-hidden
                  flex items-center justify-center w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 
                  md:w-32  lg:w-36 lg:h-36 xl:w-40"
                            >
                                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full" />
                            </div>
                            <div className="h-4 bg-gray-200 rounded-md w-24 mx-auto mb-1 text-center mt-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategorySkeletonLoading;