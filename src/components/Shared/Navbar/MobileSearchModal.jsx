'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';
import { apiClient } from '@/lib/apiClient';

export default function MobileSearchModal({ isOpen, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            setRecentSearches(saved.slice(0, 5));
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setSearchQuery('');
            setSuggestions([]);
        }
    }, [isOpen]);

    const performSearch = useRef(
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
                if (data?.success !== undefined) {
                    setSuggestions(data.data?.suggestions || []);
                } else if (data?.suggestions) {
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
        }, 300)
    ).current;

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim().length >= 2) {
            performSearch(value);
        } else {
            setSuggestions([]);
        }
    };

    const saveRecentSearch = (term) => {
        const updated = [
            term,
            ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase()),
        ].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        saveRecentSearch(trimmed);
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        onClose();
    };

    const handleSuggestionClick = (item) => {
        saveRecentSearch(item.name);
        if (item.type === 'product') {
            router.push(`/product/${item.slug}`);
        } else if (item.type === 'category') {
            router.push(`/products/category/${item.name}`);
        } else {
            router.push(`/search?q=${encodeURIComponent(item.name)}`);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden flex flex-col justify-start">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Slide from top modal container matching design image */}
            <div className="relative w-full bg-white shadow-2xl z-10 animate-in slide-in-from-top duration-300 rounded-b-xl border-b border-gray-200 font-outfit">
                {/* Header with Title and Close X icon inside pink/red rounded circle */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-[15px] font-bold text-gray-900">Search Products</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#5A0C3D]/10 text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Close search"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search Box with Search input & brand search button */}
                <div className="p-4">
                    <form onSubmit={handleSubmit} className="flex items-stretch w-full">
                        <div className="relative flex-1 flex items-center border border-gray-300 border-r-0 rounded-l-lg bg-white focus-within:border-[#5A0C3D]">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleChange}
                                placeholder="Search in..."
                                className="w-full py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none rounded-l-lg"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSuggestions([]);
                                    }}
                                    className="p-1.5 mr-1 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="bg-[#5A0C3D] hover:bg-[#450322] text-white px-5 rounded-r-lg flex items-center justify-center self-stretch transition-colors cursor-pointer"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin text-white" />
                            ) : (
                                <Search size={18} />
                            )}
                        </button>
                    </form>

                    {/* Suggestions list */}
                    {suggestions.length > 0 && (
                        <div className="mt-3 divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
                            {suggestions.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSuggestionClick(item)}
                                    className="w-full text-left py-2.5 px-2 flex items-center justify-between hover:bg-gray-50 text-xs font-medium text-gray-700"
                                >
                                    <span>{item.name}</span>
                                    <ChevronRight size={14} className="text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Recent searches */}
                    {!searchQuery && recentSearches.length > 0 && (
                        <div className="mt-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-2">
                                Recent Searches
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((term, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery(term);
                                            performSearch(term);
                                        }}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200"
                                    >
                                        <Clock size={12} className="text-gray-400" />
                                        <span>{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
