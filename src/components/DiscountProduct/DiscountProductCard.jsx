// components/DiscountProduct/DiscountProductCard.jsx - FIXED price range display
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaBangladeshiTakaSign } from "react-icons/fa6";
import { PiEyeLight, PiShareFatLight } from "react-icons/pi";
import { ShoppingCart, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import {
  extractVariantOptions,
  getDefaultVariant,
  calculateVariantPrice,
  getVariantImage,
  formatPrice,
} from "@/lib/variantHelpers";
import ProductImage from "../ui/ProductImage";
import { CartIcon } from "../svg";

const DiscountProductCard = ({
  product,
  user,
  onMouseEnter,
  onMouseLeave,
  isWishlistLoading,
  isCartLoading,
  onWishlistToggle,
  onCartToggle,
  onOpenQuickView,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);
  const { addToCart, isInCart } = useCart(user);

  // Determine if product is variant type
  const isVariantProduct = product.productType === "variant";

  // Initialize with default variant for variant products
  useEffect(() => {
    if (isVariantProduct) {
      const defaultVariant = getDefaultVariant(product);
      setSelectedVariant(defaultVariant);
    }
  }, [product, isVariantProduct]);

  // Get display image - prioritize variant image, then main image
  const getDisplayImage = () => {
    if (isVariantProduct && selectedVariant?.image) {
      return selectedVariant.image;
    }
    return (
      product.images?.[0] ||
      "https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png"
    );
  };

  // Extract all unique images from main product and variants to find a hover/alternative image
  const allUniqueImages = useMemo(() => {
    const images = [];
    if (product.images) {
      product.images.forEach(img => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    if (product.productVariants) {
      product.productVariants.forEach(v => {
        if (v.image && !images.includes(v.image)) images.push(v.image);
      });
    }
    return images;
  }, [product]);

  // Get images array for cart/wishlist - include variant image
  const getImagesArray = () => {
    const images = [...(product.images || [])];

    // If variant has image, add it to the beginning
    if (isVariantProduct && selectedVariant?.image) {
      // Remove duplicate if variant image already exists in array
      const filteredImages = images.filter(
        (img) => img !== selectedVariant.image,
      );
      return [selectedVariant.image, ...filteredImages];
    }

    return images;
  };

  const displayImage = getDisplayImage();
  const hoverImg = allUniqueImages.find(img => img !== displayImage) || allUniqueImages[1] || null;
  const imagesArray = getImagesArray();

  // Calculate campaign discount price for a given price
  const calculateCampaignPrice = (basePrice) => {
    if (!product.campaignInfo || !basePrice) {
      return {
        originalPrice: basePrice || 0,
        discountedPrice: basePrice || 0,
        discountAmount: 0,
      };
    }

    const discountValue = parseFloat(product.campaignInfo.discountValue) || 0;
    const maxDiscount = product.campaignInfo.maxDiscountAmount
      ? parseFloat(product.campaignInfo.maxDiscountAmount)
      : null;

    let discountAmount = 0;

    if (product.campaignInfo.discountType === "Fixed") {
      discountAmount = Math.min(discountValue, basePrice);
    } else {
      // Percentage discount
      discountAmount = (basePrice * discountValue) / 100;
      if (maxDiscount && discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    }

    const discountedPrice = Math.max(0, basePrice - discountAmount);

    return {
      originalPrice: basePrice,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  };

  // Get base price for the product (variant or regular)
  const getBasePrice = () => {
    if (isVariantProduct && selectedVariant) {
      return parseFloat(selectedVariant.price) || 0;
    }
    return parseFloat(product.price) || 0;
  };

  // Calculate variant price range with campaign discount
  const getVariantPriceRange = useMemo(() => {
    if (!isVariantProduct || !product.productVariants?.length) {
      return null;
    }

    const variants = product.productVariants;

    // Calculate discounted prices for all variants
    const variantPrices = variants.map((variant) => {
      const basePrice = parseFloat(variant.price) || 0;
      const { discountedPrice } = calculateCampaignPrice(basePrice);
      return discountedPrice;
    });

    const minPrice = Math.min(...variantPrices);
    const maxPrice = Math.max(...variantPrices);

    return {
      variantCount: variants.length,
      minPrice,
      maxPrice,
      priceRange:
        minPrice === maxPrice
          ? `BDT ${formatPrice(minPrice)}`
          : `BDT ${formatPrice(minPrice)} - BDT ${formatPrice(maxPrice)}`,
      // Also get the selected variant's price for comparison
      selectedVariantPrice: selectedVariant
        ? calculateCampaignPrice(parseFloat(selectedVariant.price) || 0)
            .discountedPrice
        : minPrice,
    };
  }, [isVariantProduct, product.productVariants, selectedVariant, formatPrice]);

  // Calculate ORIGINAL variant price range (before discount)
  const getOriginalVariantPriceRange = useMemo(() => {
    if (!isVariantProduct || !product.productVariants?.length) {
      return null;
    }

    const variants = product.productVariants;
    const originalPrices = variants.map(
      (variant) => parseFloat(variant.price) || 0,
    );
    const minOriginalPrice = Math.min(...originalPrices);
    const maxOriginalPrice = Math.max(...originalPrices);

    return {
      minOriginalPrice,
      maxOriginalPrice,
      originalPriceRange:
        minOriginalPrice === maxOriginalPrice
          ? `BDT ${formatPrice(minOriginalPrice)}`
          : `BDT ${formatPrice(minOriginalPrice)} - BDT ${formatPrice(maxOriginalPrice)}`,
    };
  }, [isVariantProduct, product.productVariants, formatPrice]);

  // Get prices for selected variant or regular product
  const getCurrentPrices = () => {
    const basePrice = getBasePrice();
    return calculateCampaignPrice(basePrice);
  };

  const { originalPrice, discountedPrice, discountAmount } = getCurrentPrices();
  const discountValue = product.campaignInfo?.discountValue || 0;
  const isWishlisted = isInWishlist(
    product.id,
    isVariantProduct ? selectedVariant?.id : null,
  );
  const inCart = isInCart(
    product.id,
    isVariantProduct ? selectedVariant?.id : null,
  );

  // Check availability
  const availableQuantity = isVariantProduct
    ? (selectedVariant?.quantity ?? 0)
    : product.quantity || 0;

  const isAvailable =
    availableQuantity > 0 &&
    (product.status === true || product.status === "true");

  // Check if any variant is available for variant products
  const isAnyVariantAvailable = useMemo(() => {
    if (!isVariantProduct) return isAvailable;

    return (
      product.productVariants?.some((variant) => (variant.quantity || 0) > 0) ||
      false
    );
  }, [isVariantProduct, product.productVariants, isAvailable]);

  // Handle wishlist
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistLoading) return;
    onWishlistToggle(product.id, true);

    try {
      if (isWishlisted) {
        const success = await removeFromWishlist(product.id, selectedVariant?.id);
        if (success) {
          toast.success("Removed from wishlist");
        }
      } else {
        const wishlistProduct = {
          id: product.id,
          slug: product.slug,
          sku: isVariantProduct ? selectedVariant?.sku : product.sku,
          productName: product.productName,
          price: originalPrice,
          discountPrice: discountedPrice,
          quantity: availableQuantity,
          images: imagesArray,
          status: product.status,
          subCategoryId: product.subCategoryId,
          taxType: product.taxType,
          tax: product.tax,
          discountValue: discountValue,
          discountAmount: discountAmount,
          discountType: product.campaignInfo?.discountType || "Percentage",
          createdAt: product.createdAt,
          // Include variant info if applicable
          ...(isVariantProduct &&
            selectedVariant && {
              variantId: selectedVariant.id,
              variantAttributes: selectedVariant.attributes,
              productType: "variant",
            }),
          // Include campaign info
          ...(product.campaignInfo && {
            campaignInfo: {
              campaignId: product.campaignInfo.campaignId,
              campaignName: product.campaignInfo.campaignName,
              campaignType: product.campaignInfo.campaignType,
              discountValue: product.campaignInfo.discountValue,
              maxDiscountAmount: product.campaignInfo.maxDiscountAmount,
              calculatedDiscount: discountAmount,
              priority: product.campaignInfo.priority,
              endAt: product.campaignInfo.endAt,
              badgeText: product.campaignInfo.badgeText,
              badgeColor: product.campaignInfo.badgeColor,
            },
          }),
        };
        await addToWishlist(wishlistProduct);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      onWishlistToggle(product.id, false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCartLoading || !isAvailable) return;
    onCartToggle(product.id, true);

    try {
      // Build cart product with all discount info
      const cartProduct = {
        id: product.id,
        productId: product.id,
        slug: product.slug,
        productName: product.productName,
        price: discountedPrice,
        originalPrice: originalPrice,
        images: imagesArray,
        quantity: 1,
        status: product.status,
        taxType: product.taxType,
        tax: product.tax,
        sku: isVariantProduct ? selectedVariant?.sku : product.sku,
        discountValue: discountValue,
        discountAmount: discountAmount,
        discountType: product.campaignInfo?.discountType || "Percentage",
        // Include variant info
        ...(isVariantProduct &&
          selectedVariant && {
            variantId: selectedVariant.id,
            variantAttributes: selectedVariant.attributes,
            productType: "variant",
          }),
        // Include campaign info
        ...(product.campaignInfo && {
          campaignId: product.campaignInfo.campaignId,
          campaignName: product.campaignInfo.campaignName,
          campaignType: product.campaignInfo.campaignType,
          maxDiscountAmount: product.campaignInfo.maxDiscountAmount,
          isCampaignProduct: true,
        }),
      };

      const success = await addToCart(
        cartProduct,
        1,
        isVariantProduct ? selectedVariant?.id : null,
      );

      if (success) {
        toast.success("Added to cart!");
      } else {
        toast.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      onCartToggle(product.id, false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/discount-campaigns/${product.slug}`;
    const shareText = `Check out ${product.productName} at BDT ${formatPrice(discountedPrice)}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.productName,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link");
      });
  };
  return (
    <Link
      href={`/discount-campaigns/${product.slug}`}
      className="block group/card animate-fadeIn"
      prefetch={false}
    >
      <div 
        className="flex flex-col relative w-full"
        onMouseEnter={() => { setIsHovered(true); onMouseEnter && onMouseEnter(); }}
        onMouseLeave={() => { setIsHovered(false); onMouseLeave && onMouseLeave(); }}
      >
        {/* Image Container with rounded corners & border */}
        <div className="relative w-full aspect-[2/3] rounded-[12px] md:rounded-[12px] overflow-hidden bg-gray-100 border border-gray-100">
          {/* Discount Badge */}
          {discountValue > 0 && (
            <div className="absolute top-0 left-0 z-20">
              <span className="bg-[#FF0000] text-white text-[12px] md:text-[14px] font-bold px-4 pt-3 pb-1 rounded-[4px] font-outfit">
                -{discountValue}%
              </span>
            </div>
          )}

          {/* Wishlist Heart Button (Top Right) */}
          <button
            onClick={toggleWishlist}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-20 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-[#5A0C3D] border-t-transparent rounded-full"></span>
            ) : (
              <Heart 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isWishlisted ? 'fill-[#5A0C3D] text-[#5A0C3D]' : 'text-black hover:text-[#5A0C3D]'
                }`} 
              />
            )}
          </button>

          {/* Product Image */}
          <div className="w-full h-full relative">
            {/* Default Display Image */}
            <Image
              src={displayImage}
              alt={product.productName}
              fill
              priority
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className={`object-cover transition-opacity duration-700 ${hoverImg && isHovered ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Alternative/Variant Hover Image */}
            {hoverImg && (
              <Image
                src={hoverImg}
                alt={product.productName}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`object-cover absolute inset-0 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>

          {/* Select Options Button (Bottom Center) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenQuickView && onOpenQuickView(product);
            }}
            className="absolute bottom-3 left-3 right-3 z-20 py-2.5 bg-white text-center rounded-[8px] font-outfit text-xs md:text-sm font-regular !text-black shadow-sm hover:!bg-[#5A0C3D] hover:!text-white transition-colors duration-200 cursor-pointer"
          >
            {isVariantProduct && product.productVariants?.length > 1
              ? "Select Options"
              : "View Details"}
          </button>
        </div>

        {/* Info Section (Below Image) */}
        <div className="pt-3 pb-2 flex flex-col items-start">
          <h3 className="text-sm md:text-[18px] font-outfit font-regular text-black line-clamp-1 group-hover/card:text-[#5A0C3D] transition-colors duration-200 hover:underline cursor-pointer">
            {product.productName}
          </h3>

          {/* Prices */}
          {isVariantProduct &&
          getVariantPriceRange &&
          getOriginalVariantPriceRange ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[14px] md:text-[18px] font-outfit font-semibold text-black">
                {getVariantPriceRange.priceRange}
              </span>
              {discountValue > 0 &&
                getVariantPriceRange.minPrice !==
                  getOriginalVariantPriceRange.minOriginalPrice && (
                  <span className="text-xs md:text-sm text-gray-400 font-outfit font-normal line-through">
                    {getOriginalVariantPriceRange.originalPriceRange}
                  </span>
                )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="text-[14px] md:text-[18px] font-outfit font-semibold text-black">
                BDT {formatPrice(discountedPrice)}
              </span>
              {discountValue > 0 && originalPrice !== discountedPrice && (
                <span className="text-xs md:text-sm text-gray-400 font-outfit font-normal line-through">
                  BDT {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DiscountProductCard;
