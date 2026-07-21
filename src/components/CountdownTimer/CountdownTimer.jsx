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
                        <div className="flex flex-col items-center gap-0.5">

                            {/* Flip card tile in brand plum #5A0C3D */}
                            <div
                                className="
                                    relative overflow-hidden
                                    w-[26px] h-[30px]
                                    sm:w-[32px] sm:h-[36px]
                                    md:w-[36px] md:h-[40px]
                                    bg-[#5A0C3D]
                                    rounded-md
                                    flex items-center justify-center
                                    shadow-2xs
                                "
                            >
                                {/* Top half subtle sheen */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 z-10 pointer-events-none" />

                                {/* Center divider line */}
                                <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/20 z-20 pointer-events-none" />

                                {/* Number */}
                                <span
                                    className="
                                        relative z-10
                                        text-[12px] sm:text-[15px] md:text-[17px]
                                        font-bold leading-none
                                        text-white
                                        font-outfit
                                        tracking-tight
                                    "
                                >
                                    {formatNumber(unit.value)}
                                </span>
                            </div>

                            {/* Label */}
                            <span className="text-[6.5px] sm:text-[7.5px] font-bold tracking-widest text-[#5A0C3D] uppercase font-outfit">
                                {unit.label}
                            </span>
                        </div>

                        {/* Separator colon */}
                        {index < timeUnits.length - 1 && (
                            <span className="text-[12px] md:text-[14px] font-bold text-[#5A0C3D]/40 mb-2 select-none font-outfit">
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
