'use client'

import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        if (!endDate) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const targetDate = new Date(endDate);
            const difference = targetDate - now;

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }

            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    const formatNumber = (num) => {
        return num < 10 ? `0${num}` : num.toString();
    };

    const timeUnits = [
        { value: timeLeft.days, label: 'DAYS' },
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MINS' },
        { value: timeLeft.seconds, label: 'SECS' }
    ];

    if (!endDate) {
        return (
            <div className="w-full flex items-center justify-center bg-[#1e1e1e] rounded-lg py-3 px-3">
                <span className="text-white text-sm font-semibold tracking-wider uppercase">
                    Ongoing
                </span>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center">
            <div className="flex items-center justify-center flex-wrap gap-0.5 sm:gap-1 md:gap-1.5">
                {timeUnits.map((unit, index) => (
                    <React.Fragment key={unit.label}>

                        {/* Tile + Label */}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1">

                            {/* Flip card tile */}
                            <div
                                className="
                                    relative overflow-hidden
                                    w-[36px] h-[44px]
                                    sm:w-[42px] sm:h-[50px]
                                    md:w-[48px] md:h-[56px]
                                    bg-[#3a3a3a]
                                    rounded-md
                                    flex items-center justify-center
                                "
                                style={{
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.4)'
                                }}
                            >
                                {/* Top half sheen */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/[0.3] z-10 pointer-events-none" />

                                {/* Center divider line */}
                                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/60 z-20 pointer-events-none" />

                                {/* Number */}
                                <span
                                    className="
                                        relative z-10
                                        text-[16px] sm:text-[20px] md:text-[24px]
                                        font-bold leading-none
                                        text-[#e8e8e8]
                                        tracking-tighter
                                    "
                                    style={{
                                        fontFamily: "'Georgia', 'Times New Roman', serif",
                                        textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                                    }}
                                >
                                    {formatNumber(unit.value)}
                                </span>
                            </div>

                            {/* Label */}
                            <span className="text-[6px] sm:text-[7px] md:text-[8px] font-semibold tracking-[0.1em] text-[#c8a04a] uppercase">
                                {unit.label}
                            </span>
                        </div>

                        {/* Separator colon — hidden on smallest screens */}
                        {index < timeUnits.length - 1 && (
                            <span
                                className="hidden sm:block text-[14px] md:text-[18px] font-bold text-white/20 mb-2 sm:mb-3 select-none"
                                style={{ fontFamily: "'Georgia', serif" }}
                            >
                                :
                            </span>
                        )}

                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default CountdownTimer;