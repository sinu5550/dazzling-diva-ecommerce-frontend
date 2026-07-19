'use client'

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ShopByRoom = () => {

    const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);

    return (
        <div>
            <div className="relative mx-6 border-l border-stone-300 pl-6">
                <button
                    onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
                    className="flex items-center text-gray-700 text-sm hover:text-[#FDDA06] cursor-pointer font-medium transition-colors hover:text-[#FDDA06]"
                    aria-expanded={isRoomMenuOpen}
                >
                    SHOP BY ROOM
                    <ChevronDown className="w-4 h-4 ml-2" />
                </button>

                {/* Mega Menu */}
                {isRoomMenuOpen && (
                    <div className="absolute left-0 mt-1  bg-white border-t-2 border-yellow-500 rounded-md shadow-lg z-20 p-4">
                        <div className="flex  gap-10 text-sm">
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Living Room</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Sofas
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Coffee Tables
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            TV Units
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Bedroom</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Beds
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Dressers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Nightstands
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Dining Room</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Beds
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Dressers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Nightstands
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">Kids Room</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Beds
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Dressers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-gray-600 hover:text-gray-900">
                                            Nightstands
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopByRoom;
