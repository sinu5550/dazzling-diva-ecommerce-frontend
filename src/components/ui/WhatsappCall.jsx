'use client'

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsappCall = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPulsing, setIsPulsing] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Enhanced WhatsApp color theme
    const colors = {
        gradientStart: "#25D366",     // Keep WhatsApp green for brand consistency
        gradientEnd: "#0ABDE3",     // Keep cyan for harmony
        primary: "#128C7E",     // WhatsApp's classic darker teal
        primaryDark: "#075E54",     // Classic WhatsApp deep green
        accent: "#FF3E4D",     // Can stay for CTAs
        background: "#F0F0F0",     // Light gray background
        surface: "#FFFFFF",     // White surfaces/cards
        text: "#000000",     // Black text for dark mode
    };

    const whatsappNumber = '+8801324297000';

    const handleMouseEnter = () => setIsExpanded(true);
    const handleMouseLeave = () => setIsExpanded(false);

    // Handle WhatsApp click action
    const handleWhatsappClick = () => {
        setShowModal(true);
    };

    const handleConfirmChat = () => {
        const cleanedNumber = whatsappNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanedNumber}`, '_blank');
        setShowModal(false);

        // Fallback for desktop if app doesn't open
        setTimeout(() => {
            if (!document.hidden) {
                window.open(`https://web.whatsapp.com/send?phone=${cleanedNumber}`, '_blank');
            }
        }, 2000);
    };

    // Pulse animation effect
    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setIsPulsing(prev => !prev);
        }, 1500);

        return () => clearInterval(pulseInterval);
    }, []);

    return (
        <>
            <div className="fixed bottom-7 right-7 z-50">
                {/* Ripple effect circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className={`absolute rounded-full ${isPulsing ? 'animate-ping' : ''}`}
                        style={{
                            background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
                            width: '120%',
                            height: '120%',
                            opacity: 0.7,
                            animationDuration: '1.5s'
                        }}
                    />
                    <div
                        className={`absolute rounded-full ${isPulsing ? 'animate-ping' : ''}`}
                        style={{
                            background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
                            width: '140%',
                            height: '140%',
                            opacity: 0.5,
                            animationDuration: '1.8s',
                            animationDelay: '0.2s'
                        }}
                    />
                </div>

                {/* Main button */}
                <button
                    onClick={handleWhatsappClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex items-center justify-center overflow-hidden rounded-full shadow-lg transition-all duration-700 hover:shadow-xl cursor-pointer"
                    style={{
                        background: `linear-gradient(135deg, ${colors.gradientStart}, ${colors.gradientEnd})`,
                        width: isExpanded ? '160px' : '44px',
                        height: '44px',
                    }}
                >
                    <div className={`flex items-center justify-center transition-all duration-300 ${isExpanded ? 'gap-2' : 'gap-0'}`}>
                        <FaWhatsapp
                            size={24}
                            className="text-white"
                        />
                        <span
                            className={`text-white font-medium whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}
                            style={{
                                transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}
                        >
                            Chat with Us
                        </span>
                    </div>
                </button>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40  flex items-center justify-center z-50 p-4">
                    <div
                        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`
                        }}
                    >
                        <div className="p-6 text-center">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Start WhatsApp Chat</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            <div className="my-6 flex justify-center">
                                <div className="bg-white p-3 rounded-full">
                                    <FaWhatsapp size={40} style={{ color: colors.gradientStart }} />
                                </div>
                            </div>

                            <p className="text-white mb-2">You're about to start a chat on WhatsApp with:</p>
                            <p className="text-white font-semibold mb-6">{whatsappNumber}</p>

                            <div className="flex space-x-4 justify-center">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2 hasib-rounded font-medium border border-white text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmChat}
                                    className="px-5 py-2 hasib-rounded font-medium text-white shadow-lg hover:shadow-xl transition-all"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.accent}, #E82C50)`
                                    }}
                                >
                                    Start Chat
                                </button>
                            </div>
                        </div>

                        <div
                            className="h-2 w-full"
                            style={{
                                background: `linear-gradient(90deg, ${colors.gradientStart}, ${colors.gradientEnd}, ${colors.accent})`
                            }}
                        ></div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WhatsappCall;