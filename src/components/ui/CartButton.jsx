'use client';

import { ShoppingCart } from "lucide-react";
import { useState, useCallback } from "react";
import { useCart } from "@/hooks/useCart";
import toast from "react-hot-toast";

const CartButton = ({
    product,
    user = null,
    quantity = 1,
    disabled = false,
    // Icon props
    icon: CustomIcon = ShoppingCart,
    iconSize = 20,
    iconClassName = "",
    // Button props
    buttonClassName = "",
    activeClassName = "",
    inactiveClassName = "",
    disabledClassName = "",
    loadingClassName = "",
    // Label props
    showLabel = false,
    label = "Add to Cart",
    activeLabel = "In Cart",
    disabledLabel = "Out of Stock",
    // State props
    showTooltip = false,
    tooltipText = "Add to cart",
    activeTooltipText = "In cart",
    disabledTooltipText = "Out of stock",
    // Style variant (optional quick preset)
    variant = null,
    // Event handlers
    onSuccess,
    onError,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        addToCart,
        removeFromCart,
        isInCart
    } = useCart(user);

    const inCart = isInCart(product.id);

    // Check if product is available
    const isAvailable = (product.status === true || product.status === 'true' || product.status === undefined);
    // const isAvailable = (product.quantity > 0) && (product.status === true || product.status === 'true' || product.status === 1);
    const isDisabled = disabled || !isAvailable || isLoading;

    const handleToggle = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();


        if (isDisabled) {
            console.log('Button is disabled, skipping action');
            return;
        }

        setIsLoading(true);

        try {
            if (inCart) {
                await removeFromCart(product.id);
                onSuccess?.('removed');
            } else {
                const cartProduct = {
                    id: product.id,
                    slug: product.slug,
                    productName: product.productName,
                    price: parseFloat(product.price) || 0,
                    images: product.images || [],
                    quantity: product.quantity || 0,
                    status: product.status,
                    tax: parseFloat(product.tax) || 0,
                    taxType: product.taxType,
                    discountValue: parseFloat(product.tax) || 0,
                    discountType: product.discountType
                };
                await addToCart(cartProduct, quantity);
                onSuccess?.('added');
            }
        } catch (error) {
            console.error('Cart action failed:', error);
            toast.error('Failed to update cart');
            onError?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [inCart, isLoading, isDisabled, isAvailable, product, addToCart, removeFromCart, quantity, onSuccess, onError]);

    // Preset variants (optional)
    const presetVariants = {
        icon: {
            button: "p-2 rounded-full transition-all duration-200 cursor-pointer",
            active: "bg-green-100 text-green-600 hover:bg-green-200",
            inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200",
            disabled: "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
        },
        iconOutline: {
            button: "p-2 rounded-full border-2 transition-all duration-200 cursor-pointer",
            active: "border-green-500 text-green-600 bg-green-50",
            inactive: "border-stone-300 text-gray-600 hover:border-gray-400",
            disabled: "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
        },
        button: {
            button: "px-4 py-2 hasib-rounded font-medium transition-all duration-200 cursor-pointer",
            active: "bg-green-600 text-white hover:bg-green-700",
            inactive: "bg-primary text-black hover:bg-primary-hover",
            disabled: "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
        },
        buttonOutline: {
            button: "px-4 py-2 hasib-rounded font-medium border-2 transition-all duration-200 cursor-pointer",
            active: "border-green-600 text-green-600 bg-green-50",
            inactive: "border-primary text-primary hover:bg-primary hover:text-black",
            disabled: "border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
        },
        minimal: {
            button: "p-2 transition-all duration-200 cursor-pointer",
            active: "text-green-600 hover:bg-green-50",
            inactive: "text-gray-600 hover:bg-gray-50",
            disabled: "text-gray-300 cursor-not-allowed opacity-50"
        }
    };

    // Get preset or use custom classes
    const preset = variant ? presetVariants[variant] : null;

    // Build final class names
    const getButtonClasses = () => {
        const classes = [];

        // Base button class
        if (preset) {
            classes.push(preset.button);
        } else {
            classes.push("cursor-pointer"); // Ensure cursor pointer by default
        }
        classes.push(buttonClassName);

        // State classes
        if (isDisabled) {
            classes.push(preset?.disabled || disabledClassName || "cursor-not-allowed opacity-50");
        } else if (inCart) {
            classes.push(preset?.active || activeClassName);
        } else {
            classes.push(preset?.inactive || inactiveClassName);
        }

        // Loading class
        if (isLoading) {
            classes.push(loadingClassName || "opacity-50 cursor-wait");
        }

        // Ensure cursor pointer is added when not disabled
        if (!isDisabled && !isLoading) {
            if (!classes.includes("cursor-pointer") &&
                !classes.includes("cursor-not-allowed") &&
                !classes.includes("cursor-wait")) {
                classes.push("cursor-pointer");
            }
        }

        return classes.filter(Boolean).join(" ");
    };

    const getIconClasses = () => {
        const classes = [];
        classes.push("transition-transform duration-200");
        if (isLoading) classes.push("animate-pulse");
        if (isHovered && !isLoading && !isDisabled) classes.push("scale-110");
        classes.push(iconClassName);
        return classes.filter(Boolean).join(" ");
    };

    const getCurrentLabel = () => {
        if (!showLabel) return null;
        if (isDisabled && !isAvailable) return disabledLabel;
        if (inCart) return activeLabel;
        return label;
    };

    const getCurrentTooltip = () => {
        if (!showTooltip) return null;
        if (isDisabled && !isAvailable) return disabledTooltipText || "Out of stock";
        if (inCart) return activeTooltipText;
        return tooltipText;
    };

    const ariaLabel = inCart
        ? `Remove ${product.productName} from cart`
        : `Add ${product.productName} to cart`;

    const Icon = CustomIcon;

    return (
        <div className="relative inline-block">
            <button
                onClick={handleToggle}
                disabled={isDisabled}
                className={getButtonClasses()}
                aria-label={ariaLabel}
                title={getCurrentTooltip()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            >
                <span className={`flex items-center ${showLabel ? 'gap-2' : ''}`}>
                    <Icon
                        size={iconSize}
                        fill={inCart ? "currentColor" : "none"}
                        className={getIconClasses()}
                        strokeWidth={2}
                    />
                    {getCurrentLabel() && (
                        <span className="whitespace-nowrap">
                            {getCurrentLabel()}
                        </span>
                    )}
                </span>
            </button>

            {/* Tooltip */}
            {showTooltip && !showLabel && isHovered && !isLoading && getCurrentTooltip() && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs hasib-rounded whitespace-nowrap z-50 pointer-events-none">
                    {getCurrentTooltip()}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartButton;