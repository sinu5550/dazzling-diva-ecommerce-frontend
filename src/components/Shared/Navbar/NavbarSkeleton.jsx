export function NavbarSkeleton() {
    return (
        <div className="bg-white shadow-sm fixed top-0 w-full z-50 py-1 lg:py-0">
            <div className="animate-pulse">
                {/* Topbar skeleton */}
                <div className="h-10 bg-gray-200 mb-2" />

                {/* Main navbar skeleton */}
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex gap-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-4 w-20 bg-gray-300 rounded" />
                            ))}
                        </div>
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-4 w-16 bg-gray-300 rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}