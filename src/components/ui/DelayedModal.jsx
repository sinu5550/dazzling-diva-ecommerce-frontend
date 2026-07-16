"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useCoupons } from "@/lib/dataFetch";
import Image from "next/image";

export default function DelayedModal({ allProducts }) {
  const router = useRouter();
  const { data: couponData = [] } = useCoupons();
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastShownTime, setLastShownTime] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(100);
  const [activeCoupon, setActiveCoupon] = useState(null);


  
  // Get 3 random products from allProducts
  const randomProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];

    // Shuffle the array and take first 3
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [allProducts]);

  // Format product for display
  const formattedProducts = useMemo(() => {
    return randomProducts.map((product) => {
      // Calculate discount price
      const originalPrice = parseFloat(product.price) || 0;
      const discountValue = product.campaignInfo?.discountValue || 0;
      const maxDiscount = product.campaignInfo?.maxDiscountAmount;

      let discountedPrice = originalPrice;
      let discountAmount = 0;

      if (discountValue > 0) {
        discountAmount = (originalPrice * discountValue) / 100;
        if (maxDiscount && discountAmount > maxDiscount) {
          discountAmount = maxDiscount;
          discountedPrice = originalPrice - maxDiscount;
        } else {
          discountedPrice = originalPrice - discountAmount;
        }
      }

      // Format currency
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      // Helper to extract image URL safely
      const getImageUrl = () => {
        const img = product.images?.[0] || product.image;
        if (!img) return "https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png";
        if (typeof img === "string") return img;
        if (typeof img === "object" && img !== null) {
          return img.url || img.secure_url || "https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png";
        }
        return "https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png";
      };

      return {
        id: product.id,
        name: product.productName,
        image: getImageUrl(),
        price: formatCurrency(discountedPrice),
        originalPrice: formatCurrency(originalPrice),
        rating: product.rating || Math.floor(Math.random() * 3) + 3,
        reviewCount: product.reviewCount || Math.floor(Math.random() * 50) + 10,
        discountValue: discountValue,
        hasDiscount: discountValue > 0,
      };
    });
  }, [randomProducts]);

  // Get active coupon from your coupon data
  const getActiveCoupon = () => {
    return couponData?.find((coupon) => {
      if (!coupon.active || !coupon.appliesToAll) {
        return false;
      }

      const now = new Date();

      // Check start date if exists
      if (coupon.startAt) {
        try {
          const startAt = new Date(coupon.startAt);
          if (now < startAt) {
            return false;
          }
        } catch {
          // If date parsing fails, ignore this check
        }
      }

      // Check end date if exists
      if (coupon.endAt) {
        try {
          const endAt = new Date(coupon.endAt);
          if (now > endAt) {
            return false;
          }
        } catch {
          // If date parsing fails, ignore this check
        }
      }

      return true;
    });
  };

  // Get discount text based on coupon type
  const getDiscountText = () => {
    if (!activeCoupon) return "Special Offers Available!";

    if (activeCoupon.discountType === "Fixed") {
      return `₹${activeCoupon.discountValue} OFF`;
    } else if (activeCoupon.discountType === "Percentage") {
      return `${activeCoupon.discountValue}% OFF`;
    }
    return "Special Discount";
  };

  // Get coupon description
  const getCouponDescription = () => {
    if (!activeCoupon)
      return "Check out our exclusive deals on selected products.";

    if (activeCoupon.discountType === "Fixed") {
      return `Use code to get ₹${activeCoupon.discountValue} OFF on your order.`;
    } else if (activeCoupon.discountType === "Percentage") {
      return `Use code to get ${activeCoupon.discountValue}% OFF on your order.`;
    }
    return "Use code to get special discount on your order.";
  };

  useEffect(() => {
    // Find active coupon from API data
    const coupon = getActiveCoupon();
    setActiveCoupon(coupon);

    // Show modal regardless of coupon, but only if we have products
    if (formattedProducts.length === 0) return;

    // Simulate checking last shown time
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    // Show modal if it's never been shown or if it's been more than 1 hour
    if (!lastShownTime || now - lastShownTime > oneHour) {
      setShowModal(true);
      setLastShownTime(now);
      setCountdown(5);
      setProgress(100);

      // Trigger animation after a small delay
      setTimeout(() => {
        setIsVisible(true);
      }, 100);
    }
  }, [couponData, lastShownTime, formattedProducts]);

  // Auto-close countdown effect
  useEffect(() => {
    if (!showModal || !isVisible) return;

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Close modal when countdown reaches 0
          setIsVisible(false);
          setTimeout(() => {
            setShowModal(false);
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / 5;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(progressInterval);
    };
  }, [showModal, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowModal(false);
    }, 300);
  };

  const handleButtonClick = (url) => {
    handleClose();
    if (url === "/discount-campaigns") {
      router.push("/discount-campaigns");
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    if (!text) return;

    navigator.clipboard.writeText(text);
    Swal.fire({
      position: "top",
      icon: "success",
      title: "Copied!",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
    });
  };

  // Handle product click
  const handleProductClick = () => {
    handleClose();
    router.push(`/discount-campaigns`);
  };

  // Don't show modal if no products
  if (!showModal || formattedProducts.length === 0) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible
          ? "backdrop-blur-sm bg-black/30"
          : "backdrop-blur-none bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white hasib-rounded shadow-xl max-w-5xl w-full transform transition-all duration-300 ease-out ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors duration-200 p-1 rounded-full z-10 bg-black/30"
          aria-label="Close modal"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left section with background image */}
          <div
            className="relative p-8 text-white rounded-l-lg min-h-[400px]"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/du04p5ikw/image/upload/v1758004433/dealy_i120zf.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/40 rounded-l-lg"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl lg:text-4xl font-bold mb-4 font-philosopher">
                Don't Miss These Deals!
              </h2>
              <p className="text-lg mb-6">{getDiscountText()}</p>

              {/* Show coupon code only if active coupon exists */}
              {activeCoupon && (
                <>
                  <div className="bg-white py-2 px-4 mb-6 max-w-xl">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg font-bold text-gray-900 tracking-wide">
                        {activeCoupon.code || "Dazzling Diva"}
                      </span>
                      <span className="mx-2 text-gray-500">|</span>
                      <button
                        className="text-amber-600 hover:text-amber-700"
                        onClick={() =>
                          copyToClipboard(activeCoupon.code || "Dazzling Diva")
                        }
                      >
                        <svg
                          className="w-4 h-4 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-white/90 mb-6 max-w-xs">
                    {getCouponDescription()}
                  </p>
                </>
              )}

              {/* If no active coupon, show alternative message */}
              {!activeCoupon && (
                <p className="text-sm text-white/90 mb-6 max-w-xs">
                  Check out our exclusive deals on selected products. Limited
                  time offers!
                </p>
              )}

              {/* Action buttons */}
              <div className="w-full max-w-sm">
                <button
                  onClick={() => handleButtonClick("/discount-campaigns")}
                  className="w-full bg-[#FDDA06] text-gray-900 font-semibold py-3 hover:bg-yellow-500 transition-colors duration-200"
                >
                  {activeCoupon ? "Grab the discount" : "View All Deals"}
                </button>
              </div>
            </div>
          </div>

          {/* Right section with products and CTA */}
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 font-philosopher">
              Discount Products
            </h3>

            <div className="space-y-4 mb-5">
              {/* Map through products from allProducts */}
              {formattedProducts?.map((product) => (
                <div
                  key={product.id}
                  className="flex items-start space-x-3 cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 border border-stone-100 rounded transition-colors"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="w-24 h-20 bg-gray-200 rounded flex-shrink-0 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={80}
                      className="w-full h-full rounded"
                    />
                    {product.hasDiscount && (
                      <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1 py-0.5 rounded-tr rounded-bl">
                        {product.discountValue}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-md font-bold text-gray-900 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className="text-md font-bold text-rose-500">
                        {product.price}
                      </span>
                      {product.hasDiscount && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                  
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-close indicator with countdown */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">
                auto-closing in {countdown} seconds
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-teal-500 h-1 rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
