'use client';

import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container/Container';

const BentoImageGalleryOne = ({ bentoImageGalleryData }) => {
    const data =
        bentoImageGalleryData?.filter(
            item => item.category?.toLowerCase() === 'saree'
        ) || [];

    if (!data.length) return null;

    const items = data.slice(0, 6);

    const Card = ({ item, height = "h-[290px]" }) => {
        if (!item) return <div className={`${height}`}></div>;

        return (
            <div className={`relative overflow-hidden group ${height}`}>
                <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

                {/* Content - Enhanced with second component styling */}
                <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 pb-2 group-hover:pb-14 transition-all duration-500 ease-out">
                    <h3 className="text-white text-2xl font-bold">
                        {item.title}
                    </h3>

                    {item.sub_title && (
                        <p className="mt-2 text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 max-w-xs">
                            {item.sub_title}
                        </p>
                    )}

                    {item.link && item.link !== "" && (
                        <div className="mt-4 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                            <div className="w-10 h-[2px] bg-white mb-3"></div>
                            <Link
                                href={item.link}
                                className="inline-block px-4 py-2 border border-white text-white text-xs font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
                            >
                                View More
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="py-12">
            <Container>
                {/* Mobile */}
                <div className="grid md:hidden gap-4">
                    {items.map(item => (
                        <Card
                            key={item.id}
                            item={item}
                            height="h-[320px]"
                        />
                    ))}
                </div>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-4 grid-rows-1 gap-4">

                    {/* Left */}
                    <div className="flex flex-col gap-4">
                        <Card item={items[0]} />
                        <Card item={items[4]} />
                    </div>

                    {/* Center Left */}
                    <Card
                        item={items[1]}
                        height="h-[596px]"
                    />

                    {/* Center Right */}
                    <Card
                        item={items[2]}
                        height="h-[596px]"
                    />

                    {/* Right */}
                    <div className="flex flex-col gap-4">
                        <Card item={items[3]} />
                        <Card item={items[5]} />
                    </div>

                </div>

            </Container>
        </section>
    );
};

export default BentoImageGalleryOne;