'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, Loader2, ChevronRight, Package, Tag, Building, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { apiClient } from "@/lib/apiClient";

const SearchComponent = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    // Load recent searches from localStorage on mount
    useEffect(() => {
        const savedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(savedSearches.slice(0, 5));
    }, []);

    // Debounced search function
    const performSearch = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSuggestions([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const data = await apiClient(
                    `/api/product/search/suggestions?query=${encodeURIComponent(query)}&limit=8`
                );
                if (data.success !== undefined) {
                    setSuggestions(data.data?.suggestions || []);
                } else if (data.suggestions) {
                    setSuggestions(data.suggestions || []);
                } else {
                    setSuggestions([]);
                }
            } catch (error) {
                console.error('Search failed:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim().length >= 2) {
            performSearch(value);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(value.length === 0 ? isFocused : false);
        }
    };

    const handleSearchSubmit = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (!trimmedQuery) return;
        saveToRecentSearches(trimmedQuery);
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
        setShowSuggestions(false);
    };

    const saveToRecentSearches = (query) => {
        const updatedSearches = [
            query,
            ...recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase())
        ].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    };

    const handleSuggestionClick = (suggestion) => {
        saveToRecentSearches(suggestion.name);
        switch (suggestion.type) {
            case 'product':
                router.push(`/product/${suggestion.slug}`);
                break;
            case 'category':
                router.push(`/products/category/${suggestion.name}`);
                break;
            default:
                router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
        }
        setShowSuggestions(false);
        setSearchQuery(suggestion.name);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'product': return <Package size={12} />;
            case 'category': return <Tag size={12} />;
            case 'brand': return <Building size={12} />;
            default: return <Search size={12} />;
        }
    };

    const getTypeBadgeStyle = (type) => {
        switch (type) {
            case 'product': return { bg: '#E6F5F4', text: '#05837F' };
            case 'category': return { bg: '#FFF9E6', text: '#A07800' };
            case 'brand': return { bg: '#F3F0FF', text: '#5B4CB8' };
            default: return { bg: '#F3F4F6', text: '#6B7280' };
        }
    };

    const showDropdown = showSuggestions && (recentSearches.length > 0 || suggestions.length > 0 || (searchQuery && !isLoading));

    return (
        <div className="relative w-full" ref={searchRef}>
            {/* ─── Search Form ─── */}
            <form onSubmit={handleSearchSubmit} className="relative">
                <div
                    className={`
                        relative flex items-center bg-gray-50 border border-gray-200/80 rounded-full pr-1.5 pl-4 transition-all duration-300
                        ${isFocused ? 'border-[#5A062F] bg-white ring-2 ring-[#5A062F]/10' : 'hover:border-gray-300'}
                    `}
                >
                    {/* Input */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => {
                            setIsFocused(true);
                            setShowSuggestions(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                        className="
                            flex-1 py-2.5 pr-2 bg-transparent text-[13px] font-medium
                            !text-black placeholder-gray-400 focus:outline-none tracking-wide
                        "
                        placeholder="search..."
                        aria-label="Search products"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                    />

                    {/* Clear */}
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="flex-shrink-0 p-1 mr-1 text-gray-400 hover:text-rose-500 cursor-pointer transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {/* Submit icon button */}
                    <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className={`
                            flex-shrink-0 flex items-center justify-center
                            w-7 h-7 rounded-full transition-all duration-300 cursor-pointer
                            ${searchQuery.trim()
                                ? '!bg-[#5A062F] !text-white hover:bg-[#4a0524] active:scale-95'
                                : '!bg-[#5A062F] !text-white/80'}
                        `}
                    >
                        {isLoading ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Search size={13} />
                        )}
                    </button>
                </div>
            </form>

            {/* ─── Dropdown ─── */}
            {showDropdown && (
                <div
                    className="
                        absolute z-50 w-full mt-1 bg-white
                        border border-gray-200 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.14)]
                        max-h-[480px] overflow-y-auto rounded-[8px]
                    "
                    role="listbox"
                >
                    {/* Recent searches */}
                    {!searchQuery && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock size={11} className="text-gray-400" />
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">
                                    Recent Searches
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {recentSearches.map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSearchQuery(term);
                                            performSearch(term);
                                            setShowSuggestions(true);
                                        }}
                                        className="flex items-center justify-between w-full px-3 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors group text-left"
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <Clock size={11} className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                                            {term}
                                        </span>
                                        <ChevronRight size={11} className="text-gray-200 group-hover:text-primary transition-colors flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search results */}
                    {searchQuery && suggestions.length > 0 && (
                        <div>
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-[9px] font-black tracking-[0.2em] uppercase text-gray-400">
                                    Suggestions
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {suggestions.length} found
                                </span>
                            </div>

                            <div className="py-1">
                                {suggestions.map((suggestion, index) => {
                                    const badge = getTypeBadgeStyle(suggestion.type);
                                    return (
                                        <button
                                            key={`${suggestion.type}-${suggestion.id}-${index}`}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors group text-left"
                                            role="option"
                                        >
                                            {/* Thumbnail */}
                                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {suggestion.image ? (
                                                    <Image
                                                        src={suggestion.image}
                                                        alt={suggestion.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div style={{ color: badge.text }}>
                                                        {getTypeIcon(suggestion.type)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[13px] font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                                                        {suggestion.name}
                                                    </span>
                                                    {suggestion.type === 'product' && suggestion.brand && (
                                                        <span className="text-[10px] text-gray-400 flex-shrink-0">by {suggestion.brand}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Type badge */}
                                                    <span
                                                        className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5"
                                                        style={{ background: badge.bg, color: badge.text }}
                                                    >
                                                        {getTypeIcon(suggestion.type)}
                                                        {suggestion.type}
                                                    </span>

                                                    {suggestion.type === 'product' && suggestion.price && (
                                                        <span className="text-[12px] font-bold text-gray-900">
                                                            ৳{parseFloat(suggestion.price).toFixed(2)}
                                                        </span>
                                                    )}
                                                    {suggestion.sku && (
                                                        <span className="text-[10px] text-gray-400">
                                                            SKU: {suggestion.sku}
                                                        </span>
                                                    )}
                                                </div>

                                                {suggestion.category && suggestion.subCategory && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                                                        {suggestion.category} › {suggestion.subCategory}
                                                    </p>
                                                )}
                                            </div>

                                            <ChevronRight size={14} className="flex-shrink-0 text-gray-200 group-hover:text-primary transition-colors" />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* View all */}
                            <div className="p-3 border-t border-gray-100">
                                <button
                                    onClick={handleSearchSubmit}
                                    className="
                                        w-full py-2.5 text-[11px] font-black tracking-[0.1em] uppercase
                                        text-primary hover:bg-primary hover:text-white
                                        border border-primary transition-all duration-200
                                        flex items-center justify-center gap-2
                                    "
                                >
                                    View all results for "{searchQuery}"
                                    <ChevronRight size={13} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No results */}
                    {searchQuery && !isLoading && suggestions.length === 0 && (
                        <div className="py-10 text-center">
                            <Search size={28} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-[13px] font-semibold text-gray-600">No results for "{searchQuery}"</p>
                            <p className="text-[11px] text-gray-400 mt-1">Try different keywords or check spelling</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchComponent;