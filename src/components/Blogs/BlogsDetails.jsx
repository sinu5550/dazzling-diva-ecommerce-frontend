"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BsDot } from "react-icons/bs";
import {
  FaArrowLeft,
  FaBookmark,
  FaCalendarAlt,
  FaClock,
  FaComment,
  FaFacebook,
  FaHeart,
  FaLinkedin,
  FaRegBookmark,
  FaRegHeart,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlineLink, HiOutlineShare } from "react-icons/hi";

const BlogDetails = ({ blogData }) => {
  const router = useRouter();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const blog = blogData?.data || blogData || {};

  // Calculate reading time based on sections content
  const readingTime = useMemo(() => {
    if (!blog || !blog.sections) return 3;

    try {
      let totalWordCount = 0;

      // Count words in sections
      if (blog.sections && Array.isArray(blog.sections)) {
        blog.sections.forEach((section) => {
          // Count words in heading
          if (section.heading) {
            totalWordCount += section.heading.split(/\s+/).length;
          }

          // Count words in paragraphs
          if (section.paragraphs && Array.isArray(section.paragraphs)) {
            section.paragraphs.forEach((paragraph) => {
              // Remove HTML tags if any
              const textContent = paragraph.replace(/<[^>]*>/g, " ").trim();
              totalWordCount += textContent.split(/\s+/).length;
            });
          }
        });
      }

      // Count words in title
      if (blog.title) {
        totalWordCount += blog.title.split(/\s+/).length;
      }

      // Count words in short description
      if (blog.shortDescription) {
        totalWordCount += blog.shortDescription.split(/\s+/).length;
      }

      const readingSpeed = 200;
      const minutes = Math.ceil(totalWordCount / readingSpeed);

      // Return at least 1 minute
      return minutes < 1 ? 1 : minutes;
    } catch (error) {
      console.error("Error calculating reading time:", error);
      return 3; // Default fallback
    }
  }, [blog]);

  // Handle share functionality
  const handleShare = useCallback(
    (platform) => {
      if (!blog?.title) return;

      const currentUrl = window.location.href;
      const title = blog.title;

      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentUrl
        )}&quote=${encodeURIComponent(title)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(currentUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          currentUrl
        )}&title=${encodeURIComponent(title)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${title} - ${currentUrl}`
        )}`,
      };

      if (platform === "copy") {
        navigator.clipboard
          .writeText(currentUrl)
          .then(() => {
            alert("Link copied to clipboard!");
          })
          .catch((err) => {
            console.error("Failed to copy:", err);
          });
      } else if (shareUrls[platform]) {
        const width = 600;
        const height = 400;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        window.open(
          shareUrls[platform],
          "share",
          `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0`
        );
      }

      setShowShareMenu(false);
    },
    [blog]
  );

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest(".share-menu-container")) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showShareMenu]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showShareMenu) {
        setShowShareMenu(false);
      }
      // Ctrl/Cmd + D for bookmark
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setIsBookmarked(!isBookmarked);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShareMenu, isBookmarked]);

  if (!blog || !blog.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <FaRegBookmark className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Article Not Found
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The article you&apos;re looking for doesn&apos;t exist or may have been
            removed.
          </p>
          <Link
            href="/blogs"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-600 to-yellow-500 text-white font-semibold rounded-2xl hover:from-orange-700 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FaArrowLeft className="mr-3" />
            Browse All Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white text-gray-800">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2.5 text-gray-700 hover:text-orange-600 font-medium transition-colors duration-200 rounded"
              >
                <FaArrowLeft className="mr-2 w-4 h-4" />
                Back
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                  aria-label={isLiked ? "Unlike article" : "Like article"}
                  title={isLiked ? "Unlike" : "Like"}
                >
                  {isLiked ? (
                    <FaHeart className="w-5 h-5 text-red-500 animate-pulse" />
                  ) : (
                    <FaRegHeart className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
                  )}
                </button>

                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                  aria-label={
                    isBookmarked ? "Remove bookmark" : "Bookmark article"
                  }
                  title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  {isBookmarked ? (
                    <FaBookmark className="w-5 h-5 text-sky-600" />
                  ) : (
                    <FaRegBookmark className="w-5 h-5 text-gray-400 group-hover:text-sky-500" />
                  )}
                </button>

                <div className="relative share-menu-container">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
                    aria-label="Share article"
                    title="Share"
                  >
                    <HiOutlineShare className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-50 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wider">
                        Share this article
                      </h4>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          {
                            platform: "facebook",
                            icon: FaFacebook,
                            color: "text-blue-600",
                            bg: "bg-blue-50",
                          },
                          {
                            platform: "twitter",
                            icon: FaXTwitter,
                            color: "text-sky-500",
                            bg: "bg-sky-50",
                          },
                          {
                            platform: "linkedin",
                            icon: FaLinkedin,
                            color: "text-blue-700",
                            bg: "bg-blue-50",
                          },
                          {
                            platform: "whatsapp",
                            icon: FaWhatsapp,
                            color: "text-green-500",
                            bg: "bg-green-50",
                          },
                        ].map(({ platform, icon: Icon, color, bg }) => (
                          <button
                            key={platform}
                            onClick={() => handleShare(platform)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl ${bg} hover:scale-105 transition-all duration-200`}
                            aria-label={`Share on ${platform}`}
                          >
                            <Icon className={`w-6 h-6 mb-2 ${color}`} />
                            <span className="text-xs font-medium text-gray-700 capitalize">
                              {platform}
                            </span>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handleShare("copy")}
                        className="w-full flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200 text-gray-700 font-medium text-sm"
                      >
                        <HiOutlineLink className="w-4 h-4 mr-2" />
                        Copy Link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Article Header */}
          <header className="mb-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                <span>{formatDate(blog.publishDate)}</span> {/* Changed from createdAt to publishDate */}
              </div>
              <BsDot className="text-gray-300" />
              <div className="flex items-center">
                <FaClock className="w-4 h-4 mr-2" />
                <span>{readingTime} min read</span>
              </div>
              {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                <>
                  <BsDot className="text-gray-300" />
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                    Updated
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="font-philosopher text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
              {blog.title}
            </h1>

            {/* Short Description */}
            {blog.shortDescription && (
              <div className="mb-8 ">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {blog.shortDescription}
                </p>
              </div>
            )}

            {/* Thumbnail Image */}
            {blog.thumbnailImage && (
              <div className="mb-10">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    className="w-full h-[400px] md:h-[500px] object-cover"
                    src={blog.thumbnailImage}
                    alt={blog.title}
                    width={1200}
                    height={800}
                    loading="eager"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                </div>
              </div>
            )}
          </header>

          {/* Article Content - Sections */}
          <article className="mb-16">
            {blog.sections && Array.isArray(blog.sections) && blog.sections.length > 0 ? (
              <div className="space-y-12">
                {blog.sections.map((section, index) => (
                  <section key={section.id || index} className="blog-section">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 mb-6 pb-2 font-poppins">
                      {section.heading}
                    </h2>

                    <div className="space-y-6">
                      {section.paragraphs && Array.isArray(section.paragraphs) && section.paragraphs.map((paragraph, paraIndex) => (
                        <div key={paraIndex} className="prose prose-lg max-w-none">
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {paragraph}
                          </p>
                        </div>
                      ))}
                    </div>

                    {section.image && (
                      <div className="mt-8 mb-6">
                        <div className="relative rounded-xl overflow-hidden shadow-md">
                          <Image
                            src={section.image}
                            alt={section.heading}
                            width={800}
                            height={500}
                            className="w-full h-auto max-h-[500px] object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              // Fallback for old blog format or empty sections
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaComment className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                  Content Coming Soon
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  This article is being prepared. Please check back later for
                  the full content.
                </p>
              </div>
            )}
          </article>

          {/* Article Footer */}
          <footer className="border-t border-gray-200 pt-12 pb-16">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Enjoyed this article?
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Share it with your network and explore more insights.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center px-8 py-3 diva-rounded font-medium transition-all duration-300 ${isLiked
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md"
                    }`}
                >
                  {isLiked ? (
                    <FaHeart className="w-5 h-5 mr-3 animate-bounce" />
                  ) : (
                    <FaRegHeart className="w-5 h-5 mr-3" />
                  )}
                  {isLiked ? "Liked!" : "Like this article"}
                  {isLiked && (
                    <span className="ml-2 text-sm opacity-75">✓</span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-xl mx-auto">
                {["facebook", "twitter", "linkedin", "whatsapp"].map(
                  (platform) => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className="p-3 diva-rounded border border-gray-200 hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col items-center"
                    >
                      {platform === "facebook" && (
                        <FaFacebook className="w-6 h-6 text-blue-600 mb-2" />
                      )}
                      {platform === "twitter" && (
                        <FaXTwitter className="w-6 h-6 text-sky-500 mb-2" />
                      )}
                      {platform === "linkedin" && (
                        <FaLinkedin className="w-6 h-6 text-blue-700 mb-2" />
                      )}
                      {platform === "whatsapp" && (
                        <FaWhatsapp className="w-6 h-6 text-green-500 mb-2" />
                      )}
                      <span className="text-xs text-gray-600 capitalize">
                        {platform}
                      </span>
                    </button>
                  )
                )}
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">
                  Explore More Content
                </h4>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/blogs"
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-secound hover:bg-secound-hover text-white font-semibold rounded-md transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
                  >
                    Browse All Articles
                  </Link>
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-stone-300 text-gray-700 font-semibold rounded-md hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                  >
                    Back to Top
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Add CSS for blog content styling */}
      <style jsx global>{`
        .blog-section {
          scroll-margin-top: 100px;
        }

        .blog-section h2 {
          scroll-margin-top: 80px;
        }

        .prose p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }

        .prose strong {
          font-weight: 600;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .prose {
            font-size: 1rem;
          }
          
          .blog-section h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default BlogDetails;
