'use client'

import { useState, useEffect } from 'react';
import { TbArrowBadgeUpFilled } from "react-icons/tb";

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll progress percentage
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setScrollProgress(progress);

            // Show/hide button
            setIsVisible(scrollTop > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {isVisible && (
                <div className="fixed bottom-24 right-8 z-[9999]">
                    <button
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        className="relative w-10 h-10 flex items-center justify-center shadow-lg cursor-pointer overflow-hidden"
                    >
                        {/* White background (default) */}
                        <div className="absolute inset-0 bg-white "></div>

                        {/* Primary color progress fill */}
                        <div
                            className="absolute inset-0 bg-primary transition-all duration-200 ease-out"
                            style={{
                                width: `${scrollProgress}%`,
                            }}
                        ></div>

                        {/* Icon */}
                        <TbArrowBadgeUpFilled
                            className="text-xl relative z-10 transition-colors duration-200"
                            style={{
                                color: scrollProgress > 50 ? 'white' : 'currentColor'
                            }}
                        />
                    </button>
                </div>
            )}
        </>
    );
};

export default BackToTop;
