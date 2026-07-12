'use client'

import SkeletonFilterSidebar from "./SkeletonFilterSidebar";
import SkeletonProductCard from "./SkeletonProductCard";

const SkeletonMobileFilterToggle = () => (
    <div className="lg:hidden">
        <div className="w-full p-4 bg-gray-100 border border-gray-200 hasib-rounded mb-4 animate-pulse">
            <div className="h-5 bg-gray-300 rounded w-20"></div>
        </div>
    </div>
);

const SkeletonHeader = () => (
    <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
    </div>
);

// Main SkeletonLoader Component (now includes everything)
const SkeletonLoader = ({
    type = 'productGrid',
    count = 10,
    gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4",
    gap = "gap-4 md:gap-10",
    withFilters = false,
    withHeader = false,
}) => {

    // Product Grid with Filters skeleton
    if (type === 'productGridWithFilters') {
        return (
            <div>
                {/* Header */}
                {withHeader && <SkeletonHeader />}

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filters Toggle Skeleton */}
                    <SkeletonMobileFilterToggle />

                    {/* Filter Sidebar Skeleton */}
                    {withFilters && <SkeletonFilterSidebar />}

                    {/* Products Grid Skeleton */}
                    <div className={`${withFilters ? 'lg:w-3/4' : 'w-full'}`}>
                        {/* Product Grid */}
                        <div className={`grid ${gridCols} ${gap}`}>
                            {Array.from({ length: count }).map((_, index) => (
                                <SkeletonProductCard key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Just Product Grid
    if (type === 'productGrid') {
        return (
            <div>
                {/* Header */}
                {withHeader && <SkeletonHeader />}

                <div className={`grid ${gridCols} ${gap}`}>
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonProductCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    // Just Filters
    if (type === 'filters') {
        return (
            <div>
                {withHeader && <SkeletonHeader />}
                <div className="flex flex-col lg:flex-row gap-8">
                    <SkeletonMobileFilterToggle />
                    <SkeletonFilterSidebar />
                </div>
            </div>
        );
    }

    // Header only
    if (type === 'header') {
        return <SkeletonHeader />;
    }

    // Mobile filter only
    if (type === 'mobileFilter') {
        return (
            <div>
                {withHeader && <SkeletonHeader />}
                <SkeletonMobileFilterToggle />
            </div>
        );
    }

    // Custom - Just the product cards (no container)
    if (type === 'productCards') {
        return (
            <>
                {withHeader && <SkeletonHeader />}
                {Array.from({ length: count }).map((_, index) => (
                    <SkeletonProductCard key={index} />
                ))}
            </>
        );
    }

    // Product grid with header only (no filters)
    if (type === 'productGridWithHeader') {
        return (
            <div>
                <SkeletonHeader />
                <div className={`grid ${gridCols} ${gap}`}>
                    {Array.from({ length: count }).map((_, index) => (
                        <SkeletonProductCard key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

// Export everything from a single file
export default SkeletonLoader;

export {
    SkeletonProductCard,
    SkeletonFilterSidebar,
    SkeletonMobileFilterToggle,
    SkeletonHeader
};