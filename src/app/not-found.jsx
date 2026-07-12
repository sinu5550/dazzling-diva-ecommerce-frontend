"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiFrown, FiHome, FiRotateCcw } from "react-icons/fi";

export default function NotFound() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => router.push("/"), 9000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
            {/* Animated Stars Background */}
            {/* <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            position: "absolute",
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            backgroundColor: "white",
                            borderRadius: "50%",
                            opacity: Math.random() * 0.8 + 0.3,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div> */}

            {/* Main Content */}
            <div className="max-w-2xl w-full p-10  bg-opacity-30 backdrop-blur-lg rounded-2xl text-center z-10 transform transition-all  duration-300">

                {/* Sad Icon with Glow */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <FiFrown size={90} className="text-red-400 drop-shadow-lg animate-bounce" />
                        <div className="absolute inset-0 blur-xl bg-red-400 opacity-30 rounded-full animate-ping"></div>
                    </div>
                </div>

                {/* 404 Title */}
                <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-red-400 mb-4 tracking-wide">
                    404
                </h1>

                {/* Headline */}
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4 leading-tight">
                    Lost in Space? 🚀
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                    The page you're searching for is floating in deep space...
                    But do not worry, we’ll guide you safely back home.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-3 px-7 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 transform "
                    >
                        <FiHome /> <span>Return Home</span>
                    </Link>

                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center gap-3 px-7 py-4 bg-transparent  backdrop-blur-sm border border-gray-400 text-white font-medium rounded-xl hover:bg-opacity-20 transition-all duration-300 transform "
                    >
                        <FiRotateCcw /> <span>Go Back</span>
                    </button>
                </div>

                {/* Auto-redirect notice */}
                <p className="text-sm text-gray-300 transition-opacity duration-300">
                    Redirecting to Home page in{" "}
                    <span className="font-semibold text-yellow-200">10 seconds</span>...
                </p>
            </div>
        </div>
    );
}