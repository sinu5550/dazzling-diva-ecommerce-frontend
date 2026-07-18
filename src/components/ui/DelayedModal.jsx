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
          ? "backdrop-blur-sm bg-black/40"
          : "backdrop-blur-none bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden transform transition-all duration-300 ease-out font-outfit ${
          isVisible
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1.5 rounded-full z-15 bg-gray-100 hover:bg-gray-200"
          aria-label="Close modal"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Left section - Solid System Color Banner */}
          <div className="md:col-span-5 bg-[#5A0C3D] p-8 text-white flex flex-col justify-center items-center text-center relative">
            <div className="relative z-10 flex flex-col justify-center items-center h-full">
              <span className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-2 bg-[#CCFF00]/10 px-2.5 py-1 rounded-full">
                Exclusive Offer
              </span>
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 font-outfit tracking-tight">
                Don't Miss These Deals!
              </h2>
              <p className="text-xl font-bold mb-6 font-outfit text-[#CCFF00]">
                {getDiscountText().replace('₹', '৳')}
              </p>

              {/* Show coupon code only if active coupon exists */}
              {activeCoupon && (
                <div className="w-full">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 py-2.5 px-4 rounded-lg mb-4 flex items-center justify-between gap-2 max-w-[240px] mx-auto">
                    <span className="text-base font-bold text-white tracking-wider font-outfit">
                      {activeCoupon.code || "DAZZLE"}
                    </span>
                    <button
                      className="text-[#CCFF00] hover:text-white transition-colors duration-200"
                      onClick={() =>
                        copyToClipboard(activeCoupon.code || "DAZZLE")
                      }
                      title="Copy code"
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
                  <p className="text-xs text-white/80 mb-6 max-w-[240px] mx-auto leading-relaxed">
                    {getCouponDescription().replace('₹', '৳')}
                  </p>
                </div>
              )}

              {/* If no active coupon, show alternative message */}
              {!activeCoupon && (
                <p className="text-xs text-white/80 mb-6 max-w-[240px] mx-auto leading-relaxed">
                  Check out our exclusive deals on selected products. Limited time offers!
                </p>
              )}

              {/* Action buttons */}
              <button
                onClick={() => handleButtonClick("/discount-campaigns")}
                className="w-full max-w-[220px] bg-white text-[#5A0C3D] hover:bg-[#CCFF00] hover:text-[#5A0C3D] font-semibold py-2.5 rounded-lg transition-colors duration-300 shadow-md text-sm uppercase tracking-wider cursor-pointer"
              >
                {activeCoupon ? "Grab the discount" : "View All Deals"}
              </button>
            </div>
          </div>

          {/* Right section - Products List */}
          <div className="md:col-span-7 p-8 flex flex-col justify-between bg-white">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-outfit">
                Featured Discounts
              </h3>

              <div className="space-y-4">
                {/* Map through products from allProducts */}
                {formattedProducts?.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4 cursor-pointer bg-gray-50 hover:bg-gray-100/80 p-3 border border-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                      {product.hasDiscount && (
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-md">
                          {product.discountValue}% OFF
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate font-outfit">
                        {product.name}
                      </h4>
                      <div className="flex items-center mt-1 gap-2">
                        <span className="text-sm font-bold text-[#5A0C3D] font-outfit">
                          {product.price}
                        </span>
                        {product.hasDiscount && (
                          <span className="text-xs text-gray-400 line-through font-outfit">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-close indicator with countdown */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  Auto-closing in {countdown}s
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div
                  className="bg-[#5A0C3D] h-1 rounded-full transition-all duration-1000 ease-linear"
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
