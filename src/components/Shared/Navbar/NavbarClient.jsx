"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Topbar from "./Topbar";
import Container from "@/components/Container/Container";
import { Search, X, ChevronDown, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../../public/assects/Logo.png";
import SearchComponent from "@/components/Search/SearchComponent";
import { DropdownIcon } from "@/components/svg";

const encodeName = (name) => encodeURIComponent(name);

export default function NavbarClient({ data, contactData, config }) {
  const { mainCategories, navItems, topbarLinks } = data;
  const { CLOSE_DELAY = 150 } = config || {};

  // Desktop state
  const [activeL1, setActiveL1] = useState(null);
  const [hoveredL2Id, setHoveredL2Id] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  
  // Category flyout states
  const [flyoutL1, setFlyoutL1] = useState(null);
  const [flyoutL2, setFlyoutL2] = useState(null);

  // Scroll navigation arrow states
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Mobile state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMobileL1, setExpandedMobileL1] = useState({});
  const [expandedMobileL2, setExpandedMobileL2] = useState({});

  const closeTimerRef = useRef(null);
  const scrollRef = useRef(null);

  const checkScrollLimits = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tolerance = 2; // small tolerance margin
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
  }, []);

  const scrollContainer = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 240;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  }, []);

  const setScrollRef = useCallback((node) => {
    if (scrollRef.current) {
      if (scrollRef.current._handleWheel) {
        scrollRef.current.removeEventListener("wheel", scrollRef.current._handleWheel);
      }
      if (scrollRef.current._handleScroll) {
        scrollRef.current.removeEventListener("scroll", scrollRef.current._handleScroll);
      }
    }
    if (node) {
      const handleWheel = (e) => {
        if (e.deltaY === 0) return;
        e.preventDefault();
        node.scrollLeft += e.deltaY;
      };

      const handleScroll = () => {
        checkScrollLimits();
      };

      node.addEventListener("wheel", handleWheel, { passive: false });
      node.addEventListener("scroll", handleScroll, { passive: true });
      node._handleWheel = handleWheel;
      node._handleScroll = handleScroll;

      // Initial limits check after rendering content
      setTimeout(() => {
        const tolerance = 2;
        setCanScrollLeft(node.scrollLeft > tolerance);
        setCanScrollRight(node.scrollLeft + node.clientWidth < node.scrollWidth - tolerance);
      }, 150);
    }
    scrollRef.current = node;
  }, [checkScrollLimits]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      const threshold = announcementOpen ? 126 : 88;
      setIsSticky(window.scrollY >= threshold);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [announcementOpen]);

  // Window resize scroll limit check
  useEffect(() => {
    window.addEventListener("resize", checkScrollLimits);
    return () => window.removeEventListener("resize", checkScrollLimits);
  }, [checkScrollLimits]);

  // Check scroll limits when categories load
  useEffect(() => {
    checkScrollLimits();
  }, [mainCategories, checkScrollLimits]);

  const clearTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearTimer();
    closeTimerRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      setTimeout(() => {
        setActiveL1(null);
        setHoveredL2Id(null);
      }, 200);
    }, CLOSE_DELAY);
  }, [clearTimer, CLOSE_DELAY]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleL1Enter = useCallback(
    (category) => {
      clearTimer();
      if (!category?.categories?.length) {
        scheduleClose();
        return;
      }
      setActiveL1(category);
      setHoveredL2Id(null);
      setIsMenuOpen(true);
    },
    [clearTimer, scheduleClose],
  );

  const handleL1Leave = useCallback(() => scheduleClose(), [scheduleClose]);
  const handleMegaMenuEnter = useCallback(() => clearTimer(), [clearTimer]);
  const handleMegaMenuLeave = useCallback(
    () => scheduleClose(),
    [scheduleClose],
  );
  const handleL2Enter = useCallback((id) => setHoveredL2Id(id), []);
  const handleL2Leave = useCallback(() => setHoveredL2Id(null), []);

  const handleLinkClick = useCallback(() => {
    clearTimer();
    setIsMenuOpen(false);
    setActiveL1(null);
    setHoveredL2Id(null);
  }, [clearTimer]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileL1({});
    setExpandedMobileL2({});
  }, []);

  const toggleMobileL1 = useCallback((id) => {
    setExpandedMobileL1((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleMobileL2 = useCallback((id) => {
    setExpandedMobileL2((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const l2Items = useMemo(() => activeL1?.categories ?? [], [activeL1]);
  const isMegaMenuVisible = activeL1 && isMenuOpen;

  const normalCategories = useMemo(() => {
    return (
      mainCategories?.flatMap((mainCat) =>
        (mainCat.categories || []).map((cat) => ({
          ...cat,
          mainCatId: mainCat.id,
          mainCatName: mainCat.name,
        })),
      ) || []
    );
  }, [mainCategories]);

  // Get featured categories for right side (first 4 categories with images)
  const featuredCategories = useMemo(() => {
    return l2Items.filter((cat) => cat.image || cat.icon).slice(0, 4);
  }, [l2Items]);

  return (
    <>
      {/* Navbar Shell — Relative, normal flow so 1st and 2nd nav bars scroll out of view */}
      <div className="navbar-shell w-full relative z-[60]">
        {/* Announcement Bar */}
        {announcementOpen && (
          <div className="bg-[#5A0C3D] text-white text-[14px] h-[38px] px-4 relative flex items-center justify-center font-outfit font-normal">
            <span className="text-center tracking-wide flex items-center gap-1">
              Limited Time! Enjoy 15% OFF on Regular Items — Online Only. Shop
              Before It Ends!
            </span>
            <button
              onClick={() => setAnnouncementOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Topbar */}
        <Topbar
          scrolled={scrolled}
          onMobileMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
          isMobileMenuOpen={isMobileMenuOpen}
          contactData={contactData}
          onMobileSearchToggle={() => setMobileSearchOpen((prev) => !prev)}
          mobileSearchOpen={mobileSearchOpen}
        />
      </div>

      {/* Primary/Sub-navigation Bar — Sticky top-0 with transition classes for shadow and background */}
      <div
        className={`primary-nav sticky top-0 z-50 transition-all duration-300 bg-white border-t border-gray-100/80 py-3 lg:py-0 h-auto lg:h-[60px] flex items-center font-outfit  ${
          isSticky
            ? "shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-b border-gray-150/80 bg-white/95 backdrop-blur-md"
            : "border-b border-transparent shadow-none"
        }`}
      >
        <Container className="w-full ">
          {/* Desktop Nav Row — 3-column grid */}
          <div className="hidden lg:grid grid-cols-3 items-center w-full gap-3">
            {/* COL 1 — LEFT: Select Category + New In + Offers */}
            <div className="flex items-center gap-5 justify-start">
              {/* Select Category Dropdown */}
              <div 
                className="relative flex-shrink-0 group"
                onMouseLeave={() => {
                  setFlyoutL1(null);
                  setFlyoutL2(null);
                }}
              >
                <button className="flex items-center gap-6 px-2 pl-5 py-1 bg-gray-50 hover:bg-gray-100 !text-black text-[16px] font-normal rounded-full transition-all duration-200 border border-[#44444433] cursor-pointer whitespace-nowrap">
                  <span className="font-normal">Select Category</span>
                  <div className="rounded-full border border-[#4444441A] w-8 h-8 flex items-center justify-center">
                    <DropdownIcon className=" w-6 h-6 text-gray-500 " />
                  </div>
                </button>

                {/* Level 1 Dropdown */}
                <div className="absolute left-0 mt-1.5 w-64 bg-white border border-gray-150 shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  
                  {/* All products link */}
                  <div className="relative">
                    <Link
                      href="/product"
                      onClick={handleLinkClick}
                      className="block px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors"
                    >
                      All Products
                    </Link>
                  </div>

                  {mainCategories?.map((mainCat) => {
                    const hasL2 = mainCat.categories && mainCat.categories.length > 0;
                    const isHovered = flyoutL1?.id === mainCat.id;

                    return (
                      <div
                        key={mainCat.id}
                        onMouseEnter={() => {
                          setFlyoutL1(mainCat);
                          setFlyoutL2(null); // Reset Level 3 when switching Level 1
                        }}
                        className="relative"
                      >
                        <Link
                          href={`/products/main-category/${encodeName(mainCat.name)}`}
                          onClick={handleLinkClick}
                          className={`flex items-center justify-between px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors ${
                            isHovered ? "bg-gray-50 text-[#5A0C3D]" : ""
                          }`}
                        >
                          <span>{mainCat.name}</span>
                          {hasL2 && <ChevronRight size={14} className="text-gray-400" />}
                        </Link>

                        {/* Level 2 Submenu */}
                        {isHovered && hasL2 && (
                          <div 
                            className="absolute left-full top-0 pl-2 w-[16.5rem] z-50"
                            onMouseLeave={() => setFlyoutL2(null)}
                          >
                            <div className="bg-white border border-gray-150 shadow-xl rounded-xl py-2">
                              {mainCat.categories.map((cat) => {
                                const hasL3 = cat.subCategories && cat.subCategories.length > 0;
                                const isL2Hovered = flyoutL2?.id === cat.id;

                                return (
                                  <div
                                    key={cat.id}
                                    onMouseEnter={() => setFlyoutL2(cat)}
                                    className="relative"
                                  >
                                    <Link
                                      href={`/products/category/${encodeName(cat.name)}`}
                                      onClick={handleLinkClick}
                                      className={`flex items-center justify-between px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors ${
                                        isL2Hovered ? "bg-gray-50 text-[#5A0C3D]" : ""
                                      }`}
                                    >
                                      <span>{cat.name}</span>
                                      {hasL3 && <ChevronRight size={14} className="text-gray-400" />}
                                    </Link>

                                    {/* Level 3 Submenu */}
                                    {isL2Hovered && hasL3 && (
                                      <div className="absolute left-full top-0 pl-2 w-[16.5rem] z-50">
                                        <div className="bg-white border border-gray-150 shadow-xl rounded-xl py-2">
                                          {cat.subCategories.map((sub) => (
                                            <Link
                                              key={sub.id}
                                              href={`/products/subcategory/${encodeName(sub.name)}`}
                                              onClick={handleLinkClick}
                                              className="block px-4 py-2.5 text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors"
                                            >
                                              {sub.name}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* New In */}
              <Link
                href="/new-arrival"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-[16px] font-normal rounded-full border border-[#44444433] transition-all duration-200 flex-shrink-0 whitespace-nowrap shiny-button"
              >
                <Image src="/assects/new-icon.svg" alt="New In" width={16} height={16} className="w-5 h-5" />
                <span>New In</span>
              </Link>

              {/* Offers */}
              <Link
                href="/discount-campaigns"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 text-[16px] font-normal rounded-full border border-[#44444433] transition-all duration-200 flex-shrink-0 whitespace-nowrap shiny-button"
              >
                <Image src="/assects/offer-icon.svg" alt="Offers" width={16} height={16} className="w-5 h-5" />
                <span>Offers</span>
              </Link>
            </div>

            {/* COL 2 — CENTER: Search bar — full column width */}
            <div className="flex items-center justify-center">
              <div className="w-full">
                <SearchComponent />
              </div>
            </div>

            {/* COL 3 — RIGHT: Scrollable category pills (scrolls within col, no scrollbar) */}
            <div className="min-w-0 overflow-hidden relative group/scroll-container">
              {/* Left Arrow Button */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollContainer("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-xs border border-gray-200 rounded-full shadow-md text-gray-700 hover:bg-[#5A0C3D] hover:text-white hover:border-[#5A0C3D] opacity-0 group-hover/scroll-container:opacity-100 transition-all duration-300 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* Right Arrow Button */}
              {canScrollRight && (
                <button
                  onClick={() => scrollContainer("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur-xs border border-gray-200 rounded-full shadow-md text-gray-700 hover:bg-[#5A0C3D] hover:text-white hover:border-[#5A0C3D] opacity-0 group-hover/scroll-container:opacity-100 transition-all duration-300 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              )}

              <div
                ref={setScrollRef}
                className="flex items-center gap-4 hide-scrollbar"
                style={{
                  overflowX: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <Link
                  href="/product"
                  className="px-4 py-2 bg-white hover:bg-[#5A0C3D] hover:text-white text-gray-800 text-[16px] font-normal rounded-full border border-[#44444433] transition-all duration-200 whitespace-nowrap flex-shrink-0"
                >
                  All Products
                </Link>
                {normalCategories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products/category/${encodeName(cat.name)}`}
                    className="px-4 py-2 bg-white hover:bg-[#5A0C3D] hover:text-white text-gray-800 text-[16px] font-normal rounded-full border border-[#44444433] transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Nav Row (Simplified search & horizontal categories) */}
          <div className="flex flex-col lg:hidden gap-2 w-full">
            <div className="w-full">
              <SearchComponent />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              <Link
                href="/product"
                className="px-3.5 py-1.5 bg-white text-gray-800 text-[12px] font-normal rounded-full border border-[#44444433] whitespace-nowrap flex-shrink-0"
              >
                All Products
              </Link>
              <Link
                href="/new-arrival"
                className="px-3.5 py-1.5 bg-white text-gray-800 text-[12px] font-normal rounded-full border border-[#44444433] whitespace-nowrap flex-shrink-0 shiny-button"
              >
                New In
              </Link>
              <Link
                href="/discount-campaigns"
                className="px-3.5 py-1.5 bg-white text-gray-800 text-[12px] font-normal rounded-full border border-[#44444433] whitespace-nowrap flex-shrink-0 shiny-button"
              >
                Offers
              </Link>
              {normalCategories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products/category/${encodeName(cat.name)}`}
                  className="px-3.5 py-1.5 bg-white text-gray-800 text-[12px] font-normal rounded-full border border-[#44444433] whitespace-nowrap flex-shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </Container>
        {/* Mega Menu - positioned absolute inside primary-nav */}
        <div
          className={`
                            hidden lg:block absolute left-0 w-full bg-white border-b border-gray-200
                            transition-all z-40
                            ${
                              isMegaMenuVisible
                                ? "opacity-100 visible translate-y-0 shadow-lg duration-300 ease-out"
                                : "opacity-0 invisible -translate-y-2 pointer-events-none shadow-none duration-200 ease-in"
                            }
                        `}
          style={{ top: "100%" }}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
          aria-hidden={!isMegaMenuVisible}
        >
          <Container>
            <div
              className={`py-8 ${isMegaMenuVisible ? "mega-reveal-open" : "mega-reveal-close"}`}
            >
              <div className="flex gap-12">
                {/* Left Side - Categories Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {l2Items?.map((category) => {
                      const hasSubs = category.subCategories?.length > 0;

                      return (
                        <div
                          key={category.id}
                          className="flex flex-col space-y-3"
                        >
                          {/* Section Header - No uppercase, normal weight */}
                          <Link
                            href={`/products/category/${encodeName(category.name)}`}
                            onClick={handleLinkClick}
                            className="text-base font-semibold text-gray-900 hover:text-primary transition-colors"
                          >
                            {category.name}
                          </Link>

                          {/* Subcategory Links */}
                          {hasSubs && (
                            <ul className="flex flex-col space-y-2">
                              {category.subCategories.slice(0, 6).map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/products/subcategory/${encodeName(sub.name)}`}
                                    onClick={handleLinkClick}
                                    className="text-sm text-gray-600 hover:text-primary transition-colors block"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                              {category.subCategories.length > 6 && (
                                <li className="mt-1">
                                  <Link
                                    href={`/products/category/${encodeName(category.name)}`}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    + {category.subCategories.length - 6} more
                                  </Link>
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* View All Link - Simple, no animations */}
                  <div className="pt-8 mt-6 border-t border-gray-100">
                    <Link
                      href={`/products/main-category/${encodeName(activeL1?.name || "")}`}
                      onClick={handleLinkClick}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary capitalize"
                    >
                      View All {activeL1?.name?.toLowerCase()}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Right Side - Category Images/Icons - Raw style */}
                {featuredCategories.length > 0 && (
                  <div className="w-64 flex-shrink-0">
                    <div className="bg-gray-50 p-5">
                      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">
                        Popular
                      </h3>
                      <div className="space-y-4">
                        {featuredCategories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/products/category/${encodeName(category.name)}`}
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 group"
                          >
                            {/* Image/Icon Container - No rounded corners */}
                            <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                              {category.image ? (
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                  loading="lazy"
                                />
                              ) : category.icon ? (
                                <span className="text-2xl">
                                  {category.icon}
                                </span>
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                                  <span className="text-lg">📦</span>
                                </div>
                              )}
                            </div>

                            {/* Category Info */}
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 group-hover:text-primary transition-colors">
                                {category.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {category.subCategories?.length || 0} items
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Simple Offer Banner - No rounded corners */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="bg-secound p-3">
                          <p className="text-[10px] text-white/80">
                            SPECIAL OFFER
                          </p>
                          <p className="text-xs text-white font-medium mt-0.5">
                            Up to 15% off
                          </p>
                          <Link
                            href="/discount-campaigns"
                            onClick={handleLinkClick}
                            className="inline-block mt-2 text-[12px] text-white hover:font-bold"
                          >
                            Shop now →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        mainCategories={mainCategories}
        navItems={navItems}
        topbarLinks={topbarLinks}
        expandedMobileL1={expandedMobileL1}
        expandedMobileL2={expandedMobileL2}
        onToggleL1={toggleMobileL1}
        onToggleL2={toggleMobileL2}
        onLinkClick={closeMobileMenu}
      />

      <style jsx global>{`
        .navbar-scrolled {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        /* Shiny Button animation */
        .shiny-button {
          position: relative;
          overflow: hidden;
        }

        .shiny-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: shine 3s infinite;
        }

        .shiny-button img {
          animation: iconPulse 2.5s infinite ease-in-out;
        }

        @keyframes shine {
          0% {
            left: -150%;
          }
          30% {
            left: 150%;
          }
          100% {
            left: 150%;
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.18) rotate(6deg);
          }
        }

        /* Simple reveal animation */
        .mega-reveal-open {
          animation: megaRevealOpen 0.25s ease-out forwards;
        }

        .mega-reveal-close {
          animation: megaRevealClose 0.15s ease-in forwards;
        }

        @keyframes megaRevealOpen {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes megaRevealClose {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </>
  );
}

/* Mobile Drawer Component - Raw, no rounded corners */
function MobileDrawer({
  isOpen,
  onClose,
  mainCategories,
  navItems,
  topbarLinks,
  expandedMobileL1,
  expandedMobileL2,
  onToggleL1,
  onToggleL2,
  onLinkClick,
}) {
  const encodeName = (name) => encodeURIComponent(name);

  return (
    <div
      className={`
                fixed inset-0 z-[100]
                transition-opacity duration-300
                ${isOpen ? "opacity-100 visible bg-black/50" : "opacity-0 invisible bg-black/0 pointer-events-none"}
            `}
      onClick={onClose}
    >
      <div
        className={`
                    absolute top-0 left-0 w-[85%] max-w-[380px] h-full bg-white
                    transform transition-transform duration-300 ease-out overflow-y-auto
                    ${isOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"}
                `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header - Simple */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <Link href="/" onClick={onLinkClick}>
            {/* <Image 
                        src={logo} 
                        alt="Logo" 
                        width={100} 
                        height={50} 
                        priority 
                        /> */}
            <h4 className="text-gray-800 font-semibold">Dazzling Diva</h4>
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Categories Header */}
        <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
            Shop by category
          </span>
        </div>

        {/* Categories List */}
        <div className="divide-y divide-gray-200">
          {mainCategories?.map((mainCat, idx) => {
            const hasL2 = mainCat.categories?.length > 0;
            const isL1Open = expandedMobileL1[mainCat.id];

            return (
              <div
                key={mainCat.id}
                className="mobile-item-reveal"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-center hover:bg-gray-50 transition-colors">
                  <Link
                    href={`/products/main-category/${encodeName(mainCat.name)}`}
                    className="flex-1 px-5 py-3.5 text-xs font-medium text-gray-800 hover:text-primary transition-colors"
                    onClick={onLinkClick}
                  >
                    {mainCat.name}
                  </Link>
                  {hasL2 && (
                    <button
                      onClick={() => onToggleL1(mainCat.id)}
                      className="px-4 py-3.5 text-gray-400 hover:text-primary transition-colors"
                    >
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isL1Open ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>

                {hasL2 && (
                  <div
                    className={`
                                            overflow-hidden transition-all duration-200 ease-in-out
                                            ${isL1Open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
                                        `}
                  >
                    <div className="bg-gray-50 border-t border-gray-200">
                      {mainCat.categories.map((cat) => {
                        const hasL3 = cat.subCategories?.length > 0;
                        const isL2Open = expandedMobileL2[cat.id];

                        return (
                          <div
                            key={cat.id}
                            className="border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-center pl-7 hover:bg-white/50 transition-colors">
                              <Link
                                href={`/products/category/${encodeName(cat.name)}`}
                                className="flex-1 py-3 text-[11px] font-medium text-gray-700 hover:text-primary transition-colors"
                                onClick={onLinkClick}
                              >
                                {cat.name}
                                {hasL3 && (
                                  <span className="ml-2 text-[9px] text-gray-400">
                                    ({cat.subCategories.length})
                                  </span>
                                )}
                              </Link>
                              {hasL3 && (
                                <button
                                  onClick={() => onToggleL2(cat.id)}
                                  className="px-4 py-2.5 text-gray-400 hover:text-primary transition-colors"
                                >
                                  <ChevronDown
                                    size={12}
                                    className={`transition-transform duration-200 ${isL2Open ? "rotate-180" : ""}`}
                                  />
                                </button>
                              )}
                            </div>

                            {hasL3 && (
                              <div
                                className={`
                                                                    overflow-hidden transition-all duration-200
                                                                    ${isL2Open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                                                                `}
                              >
                                <div className="pl-12 pr-4 py-2 space-y-0.5">
                                  {cat.subCategories.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/products/subcategory/${encodeName(sub.name)}`}
                                      className="flex items-center gap-2 py-2 text-[11px] text-gray-500 hover:text-primary border-l border-transparent hover:border-[#FDDA06] pl-2 transition-all duration-150"
                                      onClick={onLinkClick}
                                    >
                                      {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Links Section */}
        <div className="mt-3">
          <div className="px-5 py-2.5 bg-gray-50 border-y border-gray-200">
            <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
              Quick links
            </span>
          </div>

          <div className="divide-y divide-gray-200">
            {topbarLinks?.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className="flex items-center justify-between px-5 py-3.5 text-xs font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                onClick={onLinkClick}
              >
                {item.label}
                <ArrowRight size={12} className="text-gray-300" />
              </Link>
            ))}

            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className="flex items-center justify-between px-5 py-3.5 text-xs font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                onClick={onLinkClick}
              >
                {item.label}
                <ArrowRight size={12} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-5 mt-4 border-t border-gray-200">
          <div className="h-[2px] w-8 bg-[#FDDA06] mb-3" />
          <p className="text-[9px] font-medium tracking-wide text-gray-400 uppercase">
            Premium quality · Fast delivery
          </p>
        </div>
      </div>
    </div>
  );
}
