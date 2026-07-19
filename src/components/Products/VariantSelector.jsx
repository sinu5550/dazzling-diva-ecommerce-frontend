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
        <div className={`space-y-6 ${className}`}>
            {variantOptions.map((option) => {
                const isColorAttribute = option.attributeName.toLowerCase().includes('color');

                return (
                    <div key={option.attributeName}>
                        <h4 className="text-sm font-semibold text-gray-900 my-2">
                            {option.attributeName}
                        </h4>

                        <div className="flex flex-wrap gap-2 font-poppins">
                            {option.values.map((value) => {
                                const isSelected = selectedAttributes[option.attributeName] === value;

                                // Check if this specific value leads to an existing variant
                                const testSelection = { ...selectedAttributes, [option.attributeName]: value };
                                const matchingVariant = findMatchingVariant(product, testSelection);
                                const variantExists = !!matchingVariant;
                                const isInStock = variantExists && matchingVariant.quantity > 0;

                                const isHexValue = isHexColor(value);

                                if (isColorAttribute && isHexValue) {
                                    // Color swatch button
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleAttributeSelect(option.attributeName, value)}
                                            className={` relative group flex flex-col items-center py-2 ${!variantExists ? 'opacity-40 cursor-pointer line-through' : 'cursor-pointer hover:scale-105'} transition-all duration-200
    `}
                                            title={!variantExists ? 'Combination not available' : (!isInStock ? 'Out of stock' : value)}
                                        >
                                            <div className="relative">
                                                <div
                                                    className={`w-10 h-10 border transition-all ${isSelected
                                                        ? 'border-gray-900'
                                                        : 'border-stone-200 hover:border-stone-400'
                                                        }`}
                                                    style={{ backgroundColor: value }}
                                                />
                                                {(!variantExists || !isInStock) && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-0.5 bg-red-500 rotate-45 transform origin-center" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom bar indicator - positioned below swatch */}
                                            {isSelected && (
                                                <div className="h-0.5 w-5 mt-1 bg-gray-900" />
                                            )}
                                        </button>
                                    );
                                } else if (isColorAttribute) {
                                    // Color name button
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleAttributeSelect(option.attributeName, value)}
                                            className={`
                                                px-4 py-2 text-sm font-medium transition-all
                                                ${isSelected
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }
                                                ${!variantExists
                                                    ? 'opacity-50 cursor-pointer line-through'
                                                    : 'cursor-pointer'
                                                }
                                            `}
                                            title={!variantExists ? 'Combination not available' : (!isInStock ? 'Out of stock' : value)}
                                        >
                                            {value}
                                            {!isInStock && variantExists && <span className="ml-1 text-xs">(Out of stock)</span>}
                                        </button>
                                    );
                                } else {
                                    // Standard button for size, etc.
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleAttributeSelect(option.attributeName, value)}
                                            className={`
                                                px-4 py-2 border  text-sm font-medium transition-all
                                                ${isSelected
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-stone-300 text-gray-700 hover:border-gray-400'
                                                }
                                                ${!variantExists
                                                    ? 'opacity-50 cursor-pointer line-through'
                                                    : 'cursor-pointer'
                                                }
                                            `}
                                            title={!variantExists ? 'Combination not available' : (!isInStock ? 'Out of stock' : value)}
                                        >
                                            {value}
                                            {!isInStock && variantExists && <span className="ml-1 text-xs">(Out of stock)</span>}
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
