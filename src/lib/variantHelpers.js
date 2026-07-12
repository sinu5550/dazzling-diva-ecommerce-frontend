// lib/variantHelpers.js

/**
 * Extract all unique variant options from product variants
 */
export function extractVariantOptions(product) {
    if (!product.productVariants || product.productVariants.length === 0) {
        return [];
    }

    const optionsMap = new Map();

    product.productVariants.forEach(variant => {
        Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!optionsMap.has(key)) {
                optionsMap.set(key, new Set());
            }
            optionsMap.get(key).add(value);
        });
    });

    return Array.from(optionsMap.entries()).map(([attributeName, values]) => ({
        attributeName,
        values: Array.from(values).sort()
    }));
}

/**
 * Get the default variant or first available variant
 */
export function getDefaultVariant(product) {
    if (!product.productVariants || product.productVariants.length === 0) {
        return null;
    }

    // Try to find default variant
    const defaultVariant = product.productVariants.find(v => v.isDefault);
    if (defaultVariant) return defaultVariant;

    // Fallback to first variant
    return product.productVariants[0];
}

/**
 * Find variant matching selected attributes
 */
export function findMatchingVariant(product, selectedAttributes) {
    if (!product.productVariants) return null;

    return product.productVariants.find(variant => {
        return Object.entries(selectedAttributes).every(
            ([key, value]) => variant.attributes[key] === value
        );
    }) || null;
}

/**
 * Get available values for an attribute based on current selection
 */
export function getAvailableValues(product, attributeName, currentSelection) {
    if (!product.productVariants) return [];

    const availableVariants = product.productVariants.filter(variant => {
        return Object.entries(currentSelection).every(([key, value]) => {
            if (key === attributeName) return true;
            return variant.attributes[key] === value;
        });
    });

    const values = new Set(
        availableVariants.map(v => v.attributes[attributeName]).filter(Boolean)
    );

    return Array.from(values).sort();
}

/**
 * Check if a specific attribute value is available (in stock)
 */
export function isValueAvailable(product, attributeName, value, currentSelection) {
    if (!product.productVariants) return false;

    const testSelection = { ...currentSelection, [attributeName]: value };
    const matchingVariant = findMatchingVariant(product, testSelection);

    return matchingVariant ? matchingVariant.quantity > 0 : false;
}

/**
 * Calculate variant price with product discount
 */
export function calculateVariantPrice(variant, product) {
    const basePrice = variant ? parseFloat(variant.price) : parseFloat(product.price);

    const discountedPrice = product.discountValue > 0
        ? basePrice - (basePrice * product.discountValue / 100)
        : basePrice;

    return {
        original: basePrice,
        discounted: discountedPrice
    };
}

/**
 * Calculate price for DISCOUNT CAMPAIGN variants
 */
export function calculateDiscountVariantPrice(variantPrice, campaignInfo) {
    const basePrice = parseFloat(variantPrice) || 0;

    if (!campaignInfo || !campaignInfo.discountValue) {
        return {
            originalPrice: basePrice,
            discountedPrice: basePrice,
            discountAmount: 0,
            discountPercentage: 0
        };
    }

    const discountValue = parseFloat(campaignInfo.discountValue);
    const maxDiscount = campaignInfo.maxDiscountAmount
        ? parseFloat(campaignInfo.maxDiscountAmount)
        : null;

    let discountAmount = 0;

    if (campaignInfo.discountType === 'Fixed') {
        discountAmount = Math.min(discountValue, basePrice);
    } else {
        discountAmount = (basePrice * discountValue) / 100;
        if (maxDiscount && discountAmount > maxDiscount) {
            discountAmount = maxDiscount;
        }
    }

    const discountedPrice = Math.max(0, basePrice - discountAmount);
    const discountPercentage = basePrice > 0
        ? Math.round((discountAmount / basePrice) * 100)
        : 0;

    return {
        originalPrice: Math.round(basePrice * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        discountPercentage
    };
}

/**
 * Get variant image or fallback to product image
 */
export function getVariantImage(variant, product) {
    if (variant?.image) return variant.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
}

/**
 * Format price with Bangladeshi Taka
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('en-BD', {
        maximumFractionDigits: 0,
    }).format(price);
}