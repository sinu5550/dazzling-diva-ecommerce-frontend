// components/Products/VariantSelector.jsx
'use client';

import { useState, useEffect } from 'react';
import {
    extractVariantOptions,
    findMatchingVariant,
    getDefaultVariant
} from '@/lib/variantHelpers';

// Helper function to check if a value is a valid hex color
const isHexColor = (value) => {
    return typeof value === 'string' && /^#[0-9A-F]{6}$/i.test(value);
};

export default function VariantSelector({ product, onVariantChange, className = '' }) {
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [variantOptions, setVariantOptions] = useState([]);

    // Initialize variant options and default selection
    useEffect(() => {
        const options = extractVariantOptions(product);
        setVariantOptions(options);

        // Set default variant's attributes
        const defaultVariant = getDefaultVariant(product);
        if (defaultVariant) {
            setSelectedAttributes(defaultVariant.attributes);
            onVariantChange(defaultVariant, defaultVariant.attributes);
        }
    }, [product]);

    // Update parent when selection changes
    useEffect(() => {
        if (Object.keys(selectedAttributes).length === variantOptions.length && variantOptions.length > 0) {
            const matchingVariant = findMatchingVariant(product, selectedAttributes);
            if (matchingVariant) {
                onVariantChange(matchingVariant, selectedAttributes);
            } else {
                // Pass null for no matching variant (combination doesn't exist)
                onVariantChange(null, selectedAttributes);
            }
        }
    }, [selectedAttributes, product, variantOptions.length]);

    const handleAttributeSelect = (attributeName, value) => {
        // Allow selection of ANY value, even if it leads to unavailable variant
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: value
        }));
    };

    if (!variantOptions.length) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {variantOptions.map((option) => {
                const isColorAttribute = option.attributeName.toLowerCase().includes('color');

                return (
                    <div key={option.attributeName}>
                        <h4 className="text-[11px] md:text-[12px] font-semibold font-outfit text-gray-500 uppercase tracking-widest mb-2">
                            Select {option.attributeName}
                        </h4>

                        <div className="flex flex-wrap gap-2.5 items-center font-outfit">
                            {option.values.map((value) => {
                                const isSelected = selectedAttributes[option.attributeName] === value;

                                const testSelection = { ...selectedAttributes, [option.attributeName]: value };
                                const matchingVariant = findMatchingVariant(product, testSelection);
                                const variantExists = !!matchingVariant;
                                const isInStock = variantExists && matchingVariant.quantity > 0;

                                const isHexValue = isHexColor(value);

                                if (isColorAttribute && isHexValue) {
                                    // Circular Color swatch button matching QuickViewModal
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleAttributeSelect(option.attributeName, value)}
                                            className={`relative w-8 h-8 rounded-full border shadow-sm transition-all duration-300 cursor-pointer ${
                                                isSelected
                                                    ? 'ring-2 ring-offset-2 ring-[#5A0C3D] scale-105 border-transparent'
                                                    : 'border-gray-200 hover:scale-105 hover:border-gray-400'
                                            } ${!variantExists ? 'opacity-40 line-through' : ''}`}
                                            style={{ backgroundColor: value }}
                                            title={!variantExists ? 'Combination not available' : (!isInStock ? 'Out of stock' : value)}
                                        >
                                            {(!variantExists || !isInStock) && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-6 h-0.5 bg-red-500 rotate-45 transform origin-center" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                } else {
                                    // Rounded box pill button matching QuickViewModal for size / text attributes
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleAttributeSelect(option.attributeName, value)}
                                            className={`h-9 px-4 border text-xs md:text-sm font-semibold flex items-center justify-center font-outfit transition-all duration-200 cursor-pointer rounded-[6px] ${
                                                isSelected
                                                    ? 'bg-black text-white border-black shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                            } ${!variantExists ? 'opacity-40 line-through' : ''}`}
                                            title={!variantExists ? 'Combination not available' : (!isInStock ? 'Out of stock' : value)}
                                        >
                                            {value}
                                            {!isInStock && variantExists && <span className="ml-1 text-[10px] opacity-75">(Out of stock)</span>}
                                        </button>
                                    );
                                }
                            })}
                        </div>
                    </div>
                );
            })}

            {/* Warning message for unavailable combinations */}
            {selectedAttributes && Object.keys(selectedAttributes).length === variantOptions.length && variantOptions.length > 0 && (
                (() => {
                    const matchingVariant = findMatchingVariant(product, selectedAttributes);
                    if (!matchingVariant) {
                        return (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 diva-rounded">
                                <p className="text-sm text-yellow-700 font-medium">
                                    ⚠️ This combination is not available. Please select another combination.
                                </p>
                            </div>
                        );
                    } else if (matchingVariant && matchingVariant.quantity === 0) {
                        return (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 diva-rounded">
                                <p className="text-sm text-red-600 font-medium">
                                    ⚠️ This combination is currently out of stock.
                                </p>
                            </div>
                        );
                    }
                    return null;
                })()
            )}
        </div>
    );
}
