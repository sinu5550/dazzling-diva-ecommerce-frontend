'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Tv, Sofa, Lamp, Utensils, Bath, Sun, Bed, ChevronRight } from 'lucide-react';
import { BiMenuAltLeft } from "react-icons/bi";

const DrawerNav = () => {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [submenuPosition, setSubmenuPosition] = useState({ top: 0 });

    // Prevent body scroll when drawer is open  
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isDrawerOpen]);

    // 3-level category structure
    const categories = [
        {
            name: 'Home',
            icon: <Tv size={18} />,
            subcategories: [
                {
                    name: 'Tables',
                    items: ['Dining Table', 'Coffee Table', 'Side Table', 'Console Table']
                },
                {
                    name: 'Storage',
                    items: ['Wardrobes', 'Cabinets', 'Shelves', 'Storage Boxes']
                }
            ]
        },
        {
            name: 'Furniture',
            icon: <Sofa size={18} />,
            subcategories: [
                {
                    name: 'Seating',
                    items: ['Sofas', 'Chairs', 'Recliners', 'Bean Bags']
                },
                {
                    name: 'Tables',
                    items: ['Dining Table', 'Kids Table', 'Center Table', 'Study Table']
                },
                {
                    name: 'Storage',
                    items: ['TV Units', 'Book Shelves', 'Shoe Racks', 'Storage Ottoman']
                }
            ]
        },
        {
            name: 'Home Decor',
            icon: <Lamp size={18} />,
            subcategories: [
                {
                    name: 'Wall Decor',
                    items: ['Wall Art', 'Mirrors', 'Wall Clocks', 'Photo Frames']
                },
                {
                    name: 'Decoratives',
                    items: ['Vases', 'Candles', 'Figurines', 'Plants']
                }
            ]
        },
        {
            name: 'Kitchen & Dining',
            icon: <Utensils size={18} />,
            subcategories: [
                {
                    name: 'Dinnerware',
                    items: ['Plates', 'Bowls', 'Cups & Mugs', 'Serving Dishes']
                },
                {
                    name: 'Cookware',
                    items: ['Pans', 'Pots', 'Baking Dishes', 'Kitchen Tools']
                }
            ]
        },
        {
            name: 'Lighting',
            icon: <Lamp size={18} />,
            subcategories: [
                {
                    name: 'Indoor Lighting',
                    items: ['Ceiling Lights', 'Table Lamps', 'Floor Lamps', 'Wall Lights']
                },
                {
                    name: 'Outdoor Lighting',
                    items: ['Garden Lights', 'String Lights', 'Solar Lights', 'Lanterns']
                }
            ]
        },
        {
            name: 'Bed & Bath',
            icon: <Bath size={18} />,
            subcategories: [
                {
                    name: 'Bedding',
                    items: ['Bed Sheets', 'Pillows', 'Comforters', 'Blankets']
                },
                {
                    name: 'Bath',
                    items: ['Towels', 'Bath Mats', 'Shower Curtains', 'Storage']
                }
            ]
        },
        {
            name: 'Outdoor',
            icon: <Sun size={18} />,
            subcategories: [
                {
                    name: 'Garden Furniture',
                    items: ['Outdoor Chairs', 'Garden Tables', 'Umbrellas', 'Loungers']
                },
                {
                    name: 'Garden Decor',
                    items: ['Planters', 'Garden Lights', 'Water Features', 'Garden Art']
                }
            ]
        },
        {
            name: 'Bedroom',
            icon: <Bed size={18} />,
            subcategories: [
                {
                    name: 'Beds',
                    items: ['King Size', 'Queen Size', 'Single Beds', 'Bunk Beds']
                },
                {
                    name: 'Storage',
                    items: ['Wardrobes', 'Dressers', 'Nightstands', 'Under-bed Storage']
                }
            ]
        },
    ];

    const handleCategoryHover = (category, event) => {
        if (category.subcategories && category.subcategories.length > 0) {
            const rect = event.currentTarget.getBoundingClientRect();
            setSubmenuPosition({ top: rect.top });
            setSelectedCategory(category);
        }
    };

    const handleCategoryLeave = () => {
        // Small delay to prevent flickering when moving to submenu
        setTimeout(() => {
            if (!document.querySelector('.submenu:hover') && !document.querySelector('.category-item:hover')) {
                setSelectedCategory(null);
            }
        }, 100);
    };

    const closeAllMenus = () => {
        setIsDrawerOpen(false);
        setSelectedCategory(null);
    };

    return (
        <>
            {/* Shop by Category Button */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center bg-[#FDDA06] hover:bg-transparent text-black font-medium text-xs px-2 py-1 transition-all duration-300 border border-[#FDDA06] cursor-pointer hover:text-[#FDDA06]"
                aria-label="Open category drawer"
            >
                <BiMenuAltLeft className="w-5 h-5 mr-2" />
                SHOP BY CATEGORY
            </button>

            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 transition-opacity duration-300"
                    onClick={closeAllMenus}
                ></div>
            )}

            {/* Drawer Sidebar */}
            <div
                className={`fixed top-0 left-0 w-64 lg:w-72 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-yellow-300 bg-[#FDDA06] w-full">
                    <div className="flex gap-2 text-center">
                        <Menu className="w-4 h-4 mt-1.5 text-gray-900" />
                        <h3 className="text-lg font-bold text-gray-900 font-serif">Shop by Categories</h3>
                    </div>
                    <button
                        onClick={closeAllMenus}
                        className="text-gray-800 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-yellow-500"
                        aria-label="Close drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="h-full pb-20">
                    <ul className="py-2">
                        {categories.map((category, index) => (
                            <li
                                key={index}
                                className="border-b border-gray-200 last:border-b-0"
                            >
                                <div
                                    className="category-item w-full flex justify-between items-center px-4 py-3 text-gray-700 transition-all duration-200 group cursor-pointer"
                                    onMouseEnter={(e) => handleCategoryHover(category, e)}
                                    onMouseLeave={handleCategoryLeave}
                                >
                                    <div className="flex items-center gap-3 group-hover:text-teal-700 transition-colors">
                                        <span className="text-gray-700 group-hover:text-teal-700 transition-colors">
                                            {category.icon}
                                        </span>
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <ChevronRight className="text-gray-400 group-hover:text-teal-600 transition-colors w-4 h-4" />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Submenu - appears to the right of the drawer */}
            {selectedCategory && selectedCategory.subcategories && (
                <div
                    className="submenu fixed left-64 lg:left-72 bg-white  border border-gray-200 rounded-r-lg z-40 w-full h-screen"
                    style={{ top: submenuPosition.top }}
                    onMouseEnter={() => setSelectedCategory(selectedCategory)}
                    onMouseLeave={() => setSelectedCategory(null)}
                >
                    <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-[#FDDA06] pb-2">
                            {selectedCategory.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-10">
                            {selectedCategory.subcategories.map((subcategory, subIndex) => (
                                <div key={subIndex} className="space-y-2">
                                    <h5 className="font-medium text-yellow-500 text-sm uppercase tracking-wide">
                                        {subcategory.name}
                                    </h5>
                                    <ul className="space-y-1">
                                        {subcategory.items.map((item, itemIndex) => (
                                            <li key={itemIndex}>
                                                <a
                                                    href="#"
                                                    className="text-gray-600 hover:text-yellow-500 transition-colors text-sm py-1 block hover:pl-2 transition-all duration-700"
                                                    onClick={closeAllMenus}
                                                >
                                                    {item}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DrawerNav;
